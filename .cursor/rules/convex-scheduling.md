Scheduling
Convex lets you easily schedule a function to run once or repeatedly in the future. This allows you to build durable workflows like sending a welcome email a day after someone joins or regularly reconciling your accounts with Stripe. Convex provides two different features for scheduling:

Scheduled Functions can be scheduled durably by any other function to run at a later point in time. You can schedule functions minutes, days, and even months in the future.
Cron Jobs schedule functions to run on a recurring basis, such as daily.
Durable function components
Built-in scheduled functions and crons work well for simpler apps and workflows. If you're operating at high scale or need more specific guarantees, use the following higher-level components for durable functions.

Convex component
Workpool
Workpool give critical tasks priority by organizing async operations into separate, customizable queues.

Convex component
Workflow
Simplify programming long running code flows. Workflows execute durably with configurable retries and delays.

Convex component
Action Retrier
Add reliability to an unreliable external service. Retry idempotent calls a set number of times.

Convex component
Crons
Use cronspec to run functions on a repeated schedule at runtime.

Scheduled Functions
Convex allows you to schedule functions to run in the future. This allows you to build powerful durable workflows without the need to set up and maintain queues or other infrastructure.

Scheduled functions are stored in the database. This means you can schedule functions minutes, days, and even months in the future. Scheduling is resilient against unexpected downtime or system restarts.

Example: Scheduling

Scheduling functions
You can schedule public functions and internal functions from mutations and actions via the scheduler provided in the respective function context.

runAfter schedules a function to run after a delay (measured in milliseconds).
runAt schedules a function run at a date or timestamp (measured in milliseconds elapsed since the epoch).
The rest of the arguments are the path to the function and its arguments, similar to invoking a function from the client. For example, here is how to send a message that self-destructs in five seconds.

convex/messages.ts
TS
import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const sendExpiringMessage = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, args) => {
    const { body, author } = args;
    const id = await ctx.db.insert("messages", { body, author });
    await ctx.scheduler.runAfter(5000, internal.messages.destruct, {
      messageId: id,
    });
  },
});

export const destruct = internalMutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
  },
});

A single function can schedule up to 1000 functions with total argument size of 8MB.

Scheduling from mutations
Scheduling functions from mutations is atomic with the rest of the mutation. This means that if the mutation succeeds, the scheduled function is guaranteed to be scheduled. On the other hand, if the mutations fails, no function will be scheduled, even if the function fails after the scheduling call.

Scheduling from actions
Unlike mutations, actions don't execute as a single database transaction and can have side effects. Thus, scheduling from actions does not depend on the outcome of the function. This means that an action might succeed to schedule some functions and later fail due to transient error or a timeout. The scheduled functions will still be executed.

Scheduling immediately
Using runAfter() with delay set to 0 is used to immediately add a function to the event queue. This usage may be familiar to you if you're used to calling setTimeout(fn, 0).

As noted above, actions are not atomic and are meant to cause side effects. Scheduling immediately becomes useful when you specifically want to trigger an action from a mutation that is conditional on the mutation succeeding. This post goes over a direct example of this in action, where the application depends on an external service to fill in information to the database.

Retrieving scheduled function status
Every scheduled function is reflected as a document in the "_scheduled_functions" system table. runAfter() and runAt() return the id of scheduled function. You can read data from system tables using the db.system.get and db.system.query methods, which work the same as the standard db.get and db.query methods.

convex/messages.ts
TS
export const listScheduledMessages = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.system.query("_scheduled_functions").collect();
  },
});

export const getScheduledMessage = query({
  args: {
    id: v.id("_scheduled_functions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.id);
  },
});

This is an example of the returned document:

{
  "_creationTime": 1699931054642.111,
  "_id": "3ep33196167235462543626ss0scq09aj4gqn9kdxrdr",
  "args": [{}],
  "completedTime": 1699931054690.366,
  "name": "messages.js:destruct",
  "scheduledTime": 1699931054657,
  "state": { "kind": "success" }
}

The returned document has the following fields:

name: the path of the scheduled function
args: the arguments passed to the scheduled function
scheduledTime: the timestamp of when the function is scheduled to run (measured in milliseconds elapsed since the epoch)
completedTime: the timestamp of when the function finished running, if it has completed (measured in milliseconds elapsed since the epoch)
state: the status of the scheduled function. Here are the possible states a scheduled function can be in:
Pending: the function has not been started yet
InProgress: the function has started running is not completed yet (only applies to actions)
Success: the function finished running successfully with no errors
Failed: the function hit an error while running, which can either be a user error or an internal server error
Canceled: the function was canceled via the dashboard, ctx.scheduler.cancel, or recursively by a parent scheduled function that was canceled while in progress
Scheduled function results are available for 7 days after they have completed.

Canceling scheduled functions
You can cancel a previously scheduled function with cancel via the scheduler provided in the respective function context.

convex/messages.ts
TS
export const cancelMessage = mutation({
  args: {
    id: v.id("_scheduled_functions"),
  },
  handler: async (ctx, args) => {
    await ctx.scheduler.cancel(args.id);
  },
});

What cancel does depends on the state of the scheduled function:

If it hasn't started running, it won't run.
If it already started, it will continue to run, but any functions it schedules will not run.
Debugging
You can view logs from previously executed scheduled functions in the Convex dashboard Logs view. You can view and cancel yet to be executed functions in the Functions view.

Error handling
Once scheduled, mutations are guaranteed to be executed exactly once. Convex will automatically retry any internal Convex errors, and only fail on developer errors. See Error Handling for more details on different error types.

Since actions may have side effects, they are not automatically retried by Convex. Thus, actions will be executed at most once, and permanently fail if there are transient errors while executing them. Developers can retry those manually by scheduling a mutation that checks if the desired outcome has been achieved and if not schedule the action again.

Auth
The auth is not propagated from the scheduling to the scheduled function. If you want to authenticate or check authorization, you'll have to pass the requisite user information in as a parameter.

Cron Jobs
Convex allows you to schedule functions to run on a recurring basis. For example, cron jobs can be used to clean up data at a regular interval, send a reminder email at the same time every month, or schedule a backup every Saturday.

Example: Cron Jobs

Defining your cron jobs
Cron jobs are defined in a crons.ts file in your convex/ directory and look like:

convex/crons.ts
TS
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "clear messages table",
  { minutes: 1 }, // every minute
  internal.messages.clearAll,
);

crons.monthly(
  "payment reminder",
  { day: 1, hourUTC: 16, minuteUTC: 0 }, // Every month on the first day at 8:00am PST
  internal.payments.sendPaymentEmail,
  { email: "my_email@gmail.com" }, // argument to sendPaymentEmail
);

// An alternative way to create the same schedule as above with cron syntax
crons.cron(
  "payment reminder duplicate",
  "0 16 1 * *",
  internal.payments.sendPaymentEmail,
  { email: "my_email@gmail.com" }, // argument to sendPaymentEmail
);

export default crons;


The first argument is a unique identifier for the cron job.

The second argument is the schedule at which the function should run, see Supported schedules below.

The third argument is the name of the public function or internal function, either a mutation or an action.

Supported schedules
crons.interval() runs a function every specified number of seconds, minutes, or hours. The first run occurs when the cron job is first deployed to Convex. Unlike traditional crons, this option allows you to have seconds-level granularity.
crons.cron() the traditional way of specifying cron jobs by a string with five fields separated by spaces (e.g. "* * * * *"). Times in cron syntax are in the UTC timezone. Crontab Guru is a helpful resource for understanding and creating schedules in this format.
crons.hourly(), crons.daily(), crons.weekly(), crons.monthly() provide an alternative syntax for common cron schedules with explicitly named arguments.
Viewing your cron jobs
You can view all your cron jobs in the Convex dashboard cron jobs view. You can view added, updated, and deleted cron jobs in the logs and history view. Results of previously executed runs of the cron jobs are also available in the logs view.

Error handling
Mutations and actions have the same guarantees that are described in Error handling for scheduled functions.

At most one run of each cron job can be executing at any moment. If the function scheduled by the cron job takes too long to run, following runs of the cron job may be skipped to avoid execution from falling behind. Skipping a scheduled run of a cron job due to the previous run still executing logs a message visible in the logs view of the dashboard.