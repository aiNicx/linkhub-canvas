Functions
Functions run on the backend and are written in JavaScript (or TypeScript). They are automatically available as APIs accessed through client libraries. Everything you do in the Convex backend starts from functions.

There are three types of functions:

Queries read data from your Convex database and are automatically cached and subscribable (realtime, reactive).
Mutations write data to the database and run as a transaction.
Actions can call OpenAI, Stripe, Twilio, or any other service or API you need to make your app work.
You can also build HTTP actions when you want to call your functions from a webhook or a custom client.

Here's an overview of the three different types of Convex functions and what they can do:

Queries	Mutations	Actions
Database access	Yes	Yes	No
Transactional	Yes	Yes	No
Cached	Yes	No	No
Real-time Updates	Yes	No	No
External API Calls (fetch)	No	No	Yes

Queries
Queries are the bread and butter of your backend API. They fetch data from the database, check authentication or perform other business logic, and return data back to the client application.

This is an example query, taking in named arguments, reading data from the database and returning a result:

convex/myFunctions.ts
TS
import { query } from "./_generated/server";
import { v } from "convex/values";

// Return the last 100 tasks in a given task list.
export const getTaskList = query({
  args: { taskListId: v.id("taskLists") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("taskListId"), args.taskListId))
      .order("desc")
      .take(100);
    return tasks;
  },
});

Read on to understand how to build queries yourself.

Query names
Queries are defined in
TypeScript
files inside your convex/ directory.

The path and name of the file, as well as the way the function is exported from the file, determine the name the client will use to call it:

convex/myFunctions.ts
TS
// This function will be referred to as `api.myFunctions.myQuery`.
export const myQuery = …;

// This function will be referred to as `api.myFunctions.sum`.
export const sum = …;

To structure your API you can nest directories inside the convex/ directory:

convex/foo/myQueries.ts
TS
// This function will be referred to as `api.foo.myQueries.listMessages`.
export const listMessages = …;


Default exports receive the name default.

convex/myFunctions.ts
TS
// This function will be referred to as `api.myFunctions.default`.
export default …;

The same rules apply to mutations and actions, while HTTP actions use a different routing approach.

Client libraries in languages other than JavaScript and TypeScript use strings instead of API objects:

api.myFunctions.myQuery is "myFunctions:myQuery"
api.foo.myQueries.myQuery is "foo/myQueries:myQuery".
api.myFunction.default is "myFunction:default" or "myFunction".
The query constructor
To actually declare a query in Convex you use the query constructor function. Pass it an object with a handler function, which returns the query result:

convex/myFunctions.ts
TS
import { query } from "./_generated/server";

export const myConstantString = query({
  handler: () => {
    return "My never changing string";
  },
});

Query arguments
Queries accept named arguments. The argument values are accessible as fields of the second parameter of the handler function:

convex/myFunctions.ts
TS
import { query } from "./_generated/server";

export const sum = query({
  handler: (_, args: { a: number; b: number }) => {
    return args.a + args.b;
  },
});

Arguments and responses are automatically serialized and deserialized, and you can pass and return most value-like JavaScript data to and from your query.

To both declare the types of arguments and to validate them, add an args object using v validators:

convex/myFunctions.ts
TS
import { query } from "./_generated/server";
import { v } from "convex/values";

export const sum = query({
  args: { a: v.number(), b: v.number() },
  handler: (_, args) => {
    return args.a + args.b;
  },
});

See argument validation for the full list of supported types and validators.

The first parameter of the handler function contains the query context.

Query responses
Queries can return values of any supported Convex type which will be automatically serialized and deserialized.

Queries can also return undefined, which is not a valid Convex value. When a query returns undefined it is translated to null on the client.

Query context
The query constructor enables fetching data, and other Convex features by passing a QueryCtx object to the handler function as the first parameter:

convex/myFunctions.ts
TS
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQuery = query({
  args: { a: v.number(), b: v.number() },
  handler: (ctx, args) => {
    // Do something with `ctx`
  },
});

Which part of the query context is used depends on what your query needs to do:

To fetch from the database use the db field. Note that we make the handler function an async function so we can await the promise returned by db.get():

convex/myFunctions.ts
TS
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTask = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

Read more about Reading Data.

To return URLs to stored files use the storage field. Read more about File Storage.

To check user authentication use the auth field. Read more about Authentication.

Splitting up query code via helpers
When you want to split up the code in your query or reuse logic across multiple Convex functions you can define and call helper
TypeScript
functions:

convex/myFunctions.ts
TS
import { Id } from "./_generated/dataModel";
import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const getTaskAndAuthor = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (task === null) {
      return null;
    }
    return { task, author: await getUserName(ctx, task.authorId ?? null) };
  },
});

async function getUserName(ctx: QueryCtx, userId: Id<"users"> | null) {
  if (userId === null) {
    return null;
  }
  return (await ctx.db.get(userId))?.name;
}


You can export helpers to use them across multiple files. They will not be callable from outside of your Convex functions.

See Type annotating server side helpers for more guidance on TypeScript types.

Using NPM packages
Queries can import NPM packages installed in node_modules. Not all NPM packages are supported, see Runtimes for more details.

npm install @faker-js/faker

convex/myFunctions.ts
TS
import { query } from "./_generated/server";
import { faker } from "@faker-js/faker";

export const randomName = query({
  args: {},
  handler: () => {
    faker.seed();
    return faker.person.fullName();
  },
});

Calling queries from clients
To call a query from React use the useQuery hook along with the generated api object.

src/MyApp.tsx
TS
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function MyApp() {
  const data = useQuery(api.myFunctions.sum, { a: 1, b: 2 });
  // do something with `data`
}

See the React client documentation for all the ways queries can be called.

Caching & reactivity & consistency
Queries have three awesome attributes:

Caching: Convex caches query results automatically. If many clients request the same query, with the same arguments, they will receive a cached response.
Reactivity: clients can subscribe to queries to receive new results when the underlying data changes.
Consistency: All database reads inside a single query call are performed at the same logical timestamp. Concurrent writes do not affect the query results.
To have these attributes the handler function must be deterministic, which means that given the same arguments (including the query context) it will return the same response.

For this reason queries cannot fetch from third party APIs. To call third party APIs, use actions.

You might wonder whether you can use non-deterministic language functionality like Math.random() or Date.now(). The short answer is that Convex takes care of implementing these in a way that you don't have to think about the deterministic constraint.

See Runtimes for more details on the Convex runtime.

Mutations
Mutations insert, update and remove data from the database, check authentication or perform other business logic, and optionally return a response to the client application.

This is an example mutation, taking in named arguments, writing data to the database and returning a result:

convex/myFunctions.ts
TS
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new task with the given text
export const createTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const newTaskId = await ctx.db.insert("tasks", { text: args.text });
    return newTaskId;
  },
});


Read on to understand how to build mutations yourself.

Mutation names
Mutations follow the same naming rules as queries, see Query names.

Queries and mutations can be defined in the same file when using named exports.

The mutation constructor
To declare a mutation in Convex use the mutation constructor function. Pass it an object with a handler function, which performs the mutation:

convex/myFunctions.ts
TS
import { mutation } from "./_generated/server";

export const mutateSomething = mutation({
  handler: () => {
    // implementation will be here
  },
});

Unlike a query, a mutation can but does not have to return a value.

Mutation arguments
Just like queries, mutations accept named arguments, and the argument values are accessible as fields of the second parameter of the handler function:

convex/myFunctions.ts
TS
import { mutation } from "./_generated/server";

export const mutateSomething = mutation({
  handler: (_, args: { a: number; b: number }) => {
    // do something with `args.a` and `args.b`

    // optionally return a value
    return "success";
  },
});

Arguments and responses are automatically serialized and deserialized, and you can pass and return most value-like JavaScript data to and from your mutation.

To both declare the types of arguments and to validate them, add an args object using v validators:

convex/myFunctions.ts
TS
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const mutateSomething = mutation({
  args: { a: v.number(), b: v.number() },
  handler: (_, args) => {
    // do something with `args.a` and `args.b`
  },
});

See argument validation for the full list of supported types and validators.

The first parameter to the handler function is reserved for the mutation context.

Mutation responses
Queries can return values of any supported Convex type which will be automatically serialized and deserialized.

Mutations can also return undefined, which is not a valid Convex value. When a mutation returns undefined it is translated to null on the client.

Mutation context
The mutation constructor enables writing data to the database, and other Convex features by passing a MutationCtx object to the handler function as the first parameter:

convex/myFunctions.ts
TS
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const mutateSomething = mutation({
  args: { a: v.number(), b: v.number() },
  handler: (ctx, args) => {
    // Do something with `ctx`
  },
});

Which part of the mutation context is used depends on what your mutation needs to do:

To read from and write to the database use the db field. Note that we make the handler function an async function so we can await the promise returned by db.insert():

convex/myFunctions.ts
TS
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addItem = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("tasks", { text: args.text });
  },
});

Read on about Writing Data.

To generate upload URLs for storing files use the storage field. Read on about File Storage.

To check user authentication use the auth field. Read on about Authentication.

To schedule functions to run in the future, use the scheduler field. Read on about Scheduled Functions.

Splitting up mutation code via helpers
When you want to split up the code in your mutation or reuse logic across multiple Convex functions you can define and call helper
TypeScript
functions:

convex/myFunctions.ts
TS
import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";

export const addItem = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("tasks", { text: args.text });
    await trackChange(ctx, "addItem");
  },
});

async function trackChange(ctx: MutationCtx, type: "addItem" | "removeItem") {
  await ctx.db.insert("changes", { type });
}


Mutations can call helpers that take a QueryCtx as argument, since the mutation context can do everything query context can.

You can export helpers to use them across multiple files. They will not be callable from outside of your Convex functions.

See Type annotating server side helpers for more guidance on TypeScript types.

Using NPM packages
Mutations can import NPM packages installed in node_modules. Not all NPM packages are supported, see Runtimes for more details.

npm install @faker-js/faker

convex/myFunctions.ts
TS
import { faker } from "@faker-js/faker";
import { mutation } from "./_generated/server";

export const randomName = mutation({
  args: {},
  handler: async (ctx) => {
    faker.seed();
    await ctx.db.insert("tasks", { text: "Greet " + faker.person.fullName() });
  },
});


Calling mutations from clients
To call a mutation from React use the useMutation hook along with the generated api object.

src/myApp.tsx
TS
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function MyApp() {
  const mutateSomething = useMutation(api.myFunctions.mutateSomething);
  const handleClick = () => {
    mutateSomething({ a: 1, b: 2 });
  };
  // pass `handleClick` to a button
  // ...
}

See the React client documentation for all the ways queries can be called.

When mutations are called from the React or Rust clients, they are executed one at a time in a single, ordered queue. You don't have to worry about mutations editing the database in a different order than they were triggered.

Transactions
Mutations run transactionally. This means that:

All database reads inside the transaction get a consistent view of the data in the database. You don't have to worry about a concurrent update changing the data in the middle of the execution.
All database writes get committed together. If the mutation writes some data to the database, but later throws an error, no data is actually written to the database.
For this to work, similarly to queries, mutations must be deterministic, and cannot call third party APIs. To call third party APIs, use actions.

Limits
Mutations have a limit to the amount of data they can read and write at once to guarantee good performance. Learn more in Read/write limit errors.

Actions
Actions can call third party services to do things such as processing a payment with Stripe. They can be run in Convex's JavaScript environment or in Node.js. They can interact with the database indirectly by calling queries and mutations.

Example: GIPHY Action

Action names
Actions follow the same naming rules as queries, see Query names.

The action constructor
To declare an action in Convex you use the action constructor function. Pass it an object with a handler function, which performs the action:

convex/myFunctions.ts
TS
import { action } from "./_generated/server";

export const doSomething = action({
  handler: () => {
    // implementation goes here

    // optionally return a value
    return "success";
  },
});

Unlike a query, an action can but does not have to return a value.

Action arguments and responses
Action arguments and responses follow the same rules as mutations:

convex/myFunctions.ts
TS
import { action } from "./_generated/server";
import { v } from "convex/values";

export const doSomething = action({
  args: { a: v.number(), b: v.number() },
  handler: (_, args) => {
    // do something with `args.a` and `args.b`

    // optionally return a value
    return "success";
  },
});

The first argument to the handler function is reserved for the action context.

Action context
The action constructor enables interacting with the database, and other Convex features by passing an ActionCtx object to the handler function as the first argument:

convex/myFunctions.ts
TS
import { action } from "./_generated/server";
import { v } from "convex/values";

export const doSomething = action({
  args: { a: v.number(), b: v.number() },
  handler: (ctx, args) => {
    // do something with `ctx`
  },
});

Which part of that action context is used depends on what your action needs to do:

To read data from the database use the runQuery field, and call a query that performs the read:

convex/myFunctions.ts
TS
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const doSomething = action({
  args: { a: v.number() },
  handler: async (ctx, args) => {
    const data = await ctx.runQuery(internal.myFunctions.readData, {
      a: args.a,
    });
    // do something with `data`
  },
});

export const readData = internalQuery({
  args: { a: v.number() },
  handler: async (ctx, args) => {
    // read from `ctx.db` here
  },
});


Here readData is an internal query because we don't want to expose it to the client directly. Actions, mutations and queries can be defined in the same file.

To write data to the database use the runMutation field, and call a mutation that performs the write:

convex/myFunctions.ts
TS
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const doSomething = action({
  args: { a: v.number() },
  handler: async (ctx, args) => {
    const data = await ctx.runMutation(internal.myMutations.writeData, {
      a: args.a,
    });
    // do something else, optionally use `data`
  },
});


Use an internal mutation when you want to prevent users from calling the mutation directly.

As with queries, it's often convenient to define actions and mutations in the same file.

To generate upload URLs for storing files use the storage field. Read on about File Storage.

To check user authentication use the auth field. Auth is propagated automatically when calling queries and mutations from the action. Read on about Authentication.

To schedule functions to run in the future, use the scheduler field. Read on about Scheduled Functions.

To search a vector index, use the vectorSearch field. Read on about Vector Search.

Dealing with circular type inference
Working around the TypeScript error: some action implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
Choosing the runtime ("use node")
Actions can run in Convex's custom JavaScript environment or in Node.js.

By default, actions run in Convex's environment. This environment supports fetch, so actions that simply want to call a third-party API using fetch can be run in this environment:

convex/myFunctions.ts
TS
import { action } from "./_generated/server";

export const doSomething = action({
  args: {},
  handler: async () => {
    const data = await fetch("https://api.thirdpartyservice.com");
    // do something with data
  },
});

Actions running in Convex's environment are faster compared to Node.js, since they don't require extra time to start up before running your action (cold starts). They can also be defined in the same file as other Convex functions. Like queries and mutations they can import NPM packages, but not all are supported.

Actions needing unsupported NPM packages or Node.js APIs can be configured to run in Node.js by adding the "use node" directive at the top of the file. Note that other Convex functions cannot be defined in files with the "use node"; directive.

convex/myAction.ts
TS
"use node";

import { action } from "./_generated/server";
import SomeNpmPackage from "some-npm-package";

export const doSomething = action({
  args: {},
  handler: () => {
    // do something with SomeNpmPackage
  },
});

Learn more about the two Convex Runtimes.

Splitting up action code via helpers
Just like with queries and mutations you can define and call helper
TypeScript
functions to split up the code in your actions or reuse logic across multiple Convex functions.

But note that the ActionCtx only has the auth field in common with QueryCtx and MutationCtx.

Calling actions from clients
To call an action from React use the useAction hook along with the generated api object.

src/myApp.tsx
TS
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export function MyApp() {
  const performMyAction = useAction(api.myFunctions.doSomething);
  const handleClick = () => {
    performMyAction({ a: 1 });
  };
  // pass `handleClick` to a button
  // ...
}

Unlike mutations, actions from a single client are parallelized. Each action will be executed as soon as it reaches the server (even if other actions and mutations from the same client are running). If your app relies on actions running after other actions or mutations, make sure to only trigger the action after the relevant previous function completes.

Note: In most cases calling an action directly from a client is an anti-pattern. Instead, have the client call a mutation which captures the user intent by writing into the database and then schedules an action:

convex/myFunctions.ts
TS
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, mutation } from "./_generated/server";

export const mutationThatSchedulesAction = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const taskId = await ctx.db.insert("tasks", { text });
    await ctx.scheduler.runAfter(0, internal.myFunctions.actionThatCallsAPI, {
      taskId,
      text,
    });
  },
});

export const actionThatCallsAPI = internalAction({
  args: { taskId: v.id("tasks"), text: v.string() },
  handler: (_, args): void => {
    // do something with `taskId` and `text`, like call an API
    // then run another mutation to store the result
  },
});


This way the mutation can enforce invariants, such as preventing the user from executing the same action twice.

Limits
Actions time out after 10 minutes. Node.js and Convex runtime have 512MB and 64MB memory limit respectively. Please contact us if you have a use case that requires configuring higher limits.

Actions can do up to 1000 concurrent operations, such as executing queries, mutations or performing fetch requests.

For information on other limits, see here.

Error handling
Unlike queries and mutations, actions may have side-effects and therefore can't be automatically retried by Convex when errors occur. For example, say your action calls Stripe to send a customer invoice. If the HTTP request fails, Convex has no way of knowing if the invoice was already sent. Like in normal backend code, it is the responsibility of the caller to handle errors raised by actions and retry the action call if appropriate.

Dangling promises
Make sure to await all promises created within an action. Async tasks still running when the function returns might or might not complete. In addition, since the Node.js execution environment might be reused between action calls, dangling promises might result in errors in subsequent action invocations.

Best practices
await ctx.runAction should only be used for crossing JS runtimes
Why? await ctx.runAction incurs to overhead of another Convex server function. It counts as an extra function call, it allocates its own system resources, and while you're awaiting this call the parent action call is frozen holding all it's resources. If you pile enough of these calls on top of each other, your app may slow down significantly.

Fix: The reason this api exists is to let you run code in the Node.js environment. If you want to call an action from another action that's in the same runtime, which is the normal case, the best way to do this is to pull the code you want to call into a TypeScript helper function and call the helper instead.

Avoid await ctx.runMutation / await ctx.runQuery
// ❌
const foo = await ctx.runQuery(...)
const bar = await ctx.runQuery(...)

// ✅
const fooAndBar = await ctx.runQuery(...)

Why? Multiple runQuery / runMutations execute in separate transactions and aren’t guaranteed to be consistent with each other (e.g. foo and bar could read the same document and return two different results), while a single runQuery / runMutation will always be consistent. Additionally, you’re paying for multiple function calls when you don’t have to.

Fix: Make a new internal query / mutation that does both things. Refactoring the code for the two functions into helpers will make it easy to create a new internal function that does both things while still keeping around the original functions. Potentially try and refactor your action code to “batch” all the database access.

Caveats: Separate runQuery / runMutation calls are valid when intentionally trying to process more data than fits in a single transaction (e.g. running a migration, doing a live aggregate).

HTTP Actions
HTTP actions allow you to build an HTTP API right in Convex!

convex/http.ts
TS
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(`Hello from ${request.url}`);
  }),
});
export default http;

HTTP actions take in a Request and return a Response following the Fetch API. HTTP actions can manipulate the request and response directly, and interact with data in Convex indirectly by running queries, mutations, and actions. HTTP actions might be used for receiving webhooks from external applications or defining a public HTTP API.

HTTP actions are exposed at https://<your deployment name>.convex.site (e.g. https://happy-animal-123.convex.site).

Example: HTTP Actions

Defining HTTP actions
HTTP action handlers are defined using the httpAction constructor, similar to the action constructor for normal actions:

convex/myHttpActions.ts
TS
import { httpAction } from "./_generated/server";

export const doSomething = httpAction(async () => {
  // implementation will be here
  return new Response();
});

The first argument to the handler is an ActionCtx object, which provides auth, storage, and scheduler, as well as runQuery, runMutation, runAction.

The second argument contains the Request data. HTTP actions do not support argument validation, as the parsing of arguments from the incoming Request is left entirely to you.

Here's an example:

convex/messages.ts
TS
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const postMessage = httpAction(async (ctx, request) => {
  const { author, body } = await request.json();

  await ctx.runMutation(internal.messages.sendOne, {
    body: `Sent via HTTP action: ${body}`,
    author,
  });

  return new Response(null, {
    status: 200,
  });
});

To expose the HTTP Action, export an instance of HttpRouter from the convex/http.ts file. To create the instance call the httpRouter function. On the HttpRouter you can expose routes using the route method:

convex/http.ts
TS
import { httpRouter } from "convex/server";
import { postMessage, getByAuthor, getByAuthorPathSuffix } from "./messages";

const http = httpRouter();

http.route({
  path: "/postMessage",
  method: "POST",
  handler: postMessage,
});

// Define additional routes
http.route({
  path: "/getMessagesByAuthor",
  method: "GET",
  handler: getByAuthor,
});

// Define a route using a path prefix
http.route({
  // Will match /getAuthorMessages/User+123 and /getAuthorMessages/User+234 etc.
  pathPrefix: "/getAuthorMessages/",
  method: "GET",
  handler: getByAuthorPathSuffix,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;


You can now call this action via HTTP and interact with data stored in the Convex Database. HTTP actions are exposed on https://<your deployment name>.convex.site.

export DEPLOYMENT_NAME=... # example: "happy-animal-123"
curl -d '{ "author": "User 123", "body": "Hello world" }' \
    -H 'content-type: application/json' "https://$DEPLOYMENT_NAME.convex.site/postMessage"


Like other Convex functions, you can view your HTTP actions in the Functions view of your dashboard and view logs produced by them in the Logs view.

Limits
HTTP actions run in the same environment as queries and mutations so also do not have access to Node.js-specific JavaScript APIs. HTTP actions can call actions, which can run in Node.js.

Like actions, HTTP actions may have side-effects and will not be automatically retried by Convex when errors occur. It is a responsibility of the caller to handle errors and retry the request if appropriate.

Request and response size is limited to 20MB.

HTTP actions support request and response body types of .text(), .json(), .blob(), and .arrayBuffer().

Note that you don't need to define an HTTP action to call your queries, mutations and actions over HTTP if you control the caller, since you can use use the JavaScript ConvexHttpClient or the Python client to call these functions directly.

Debugging
Step 1: Check that your HTTP actions were deployed.
Check the functions page in the dashboard and make sure there's an entry called http.

If not, double check that you've defined your HTTP actions with the httpRouter in a file called http.js or http.ts (the name of the file must match exactly), and that npx convex dev has no errors.

Step 2: Check that you can access your endpoint using curl
Get your URL from the dashboard under Settings > URL and Deploy Key.

Make sure this is the URL that ends in .convex.site, and not .convex.cloud. E.g. https://happy-animal-123.convex.site

Run a curl command to hit one of your defined endpoints, potentially defining a new endpoint specifically for testing

curl -X GET https://<deployment name>.convex.site/myEndpoint

Check the logs page in the dashboard to confirm that there's an entry for your HTTP action.

Step 3: Check the request being made by your browser
If you've determined that your HTTP actions have been deployed and are accessible via curl, but there are still issues requesting them from your app, check the exact requests being made by your browser.

Open the Network tab in your browser's developer tools, and trigger your HTTP requests.

Check that this URL matches what you tested earlier with curl -- it ends in .convex.site and has the right deployment name.

You should be able to see these requests in the dashboard logs page.

If you see "CORS error" or messages in the browser console like Access to fetch at '...' from origin '...' has been blocked by CORS policy, you likely need to configure CORS headers and potentially add a handler for the pre-flight OPTIONS request. See this section below.

Common patterns
File Storage
HTTP actions can be used to handle uploading and fetching stored files, see:

Uploading files via an HTTP action
Serving files from HTTP actions
CORS
To make requests to HTTP actions from a website you need to add Cross-Origin Resource Sharing (CORS) headers to your HTTP actions.

There are existing resources for exactly which CORS headers are required based on the use case. This site provides an interactive walkthrough for what CORS headers to add. Here's an example of adding CORS headers to a Convex HTTP action:

convex/http.ts
TS
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/sendImage",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Step 1: Store the file
    const blob = await request.blob();
    const storageId = await ctx.storage.store(blob);

    // Step 2: Save the storage ID to the database via a mutation
    const author = new URL(request.url).searchParams.get("author");
    await ctx.runMutation(api.messages.sendImage, { storageId, author });

    // Step 3: Return a response with the correct CORS headers
    return new Response(null, {
      status: 200,
      // CORS headers
      headers: new Headers({
        // e.g. https://mywebsite.com, configured on your Convex dashboard
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN!,
        Vary: "origin",
      }),
    });
  }),
});


Here's an example of handling a pre-flight OPTIONS request:

convex/http.ts
TS
// Pre-flight request for /sendImage
http.route({
  path: "/sendImage",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          // e.g. https://mywebsite.com, configured on your Convex dashboard
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN!,
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Digest",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});


Authentication
You can leverage Convex's built-in authentication integration and access a user identity from ctx.auth.getUserIdentity(). To do this call your endpoint with an Authorization header including a JWT token:

myPage.ts
TS
const jwtToken = "...";

fetch("https://<deployment name>.convex.site/myAction", {
  headers: {
    Authorization: `Bearer ${jwtToken}`,
  },
});

Internal Functions
Internal functions can only be called by other functions and cannot be called directly from a Convex client.

By default your Convex functions are public and accessible to clients. Public functions may be called by malicious users in ways that cause surprising results. Internal functions help you mitigate this risk. We recommend using internal functions any time you're writing logic that should not be called from a client.

While internal functions help mitigate risk by reducing the public surface area of your application, you can still validate internal invariants using argument validation and/or authentication.

Use cases for internal functions
Leverage internal functions by:

Calling them from actions via runQuery and runMutation
Calling them from HTTP actions via runQuery, runMutation, and runAction
Scheduling them from other functions to run in the future
Scheduling them to run periodically from cron jobs
Running them using the Dashboard
Running them from the CLI
Defining internal functions
An internal function is defined using internalQuery, internalMutation, or internalAction. For example:

convex/plans.ts
TS
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const markPlanAsProfessional = internalMutation({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.planId, { planType: "professional" });
  },
});

If you need to pass complicated objects to internal functions you might prefer to not use argument validation. Note though that if you're using internalQuery or internalMutation it's a better idea to pass around document IDs instead of documents, to ensure the query or mutation is working with the up-to-date state of the database.

Internal function without argument validation
Calling internal functions
Internal functions can be called from actions and scheduled from actions and mutation using the internal object.

For example, consider this public upgrade action that calls the internal plans.markPlanAsProfessional mutation we defined above:

convex/changes.ts
TS
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const upgrade = action({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    // Call out to payment provider (e.g. Stripe) to charge customer
    const response = await fetch("https://...");
    if (response.ok) {
      // Mark the plan as "professional" in the Convex DB
      await ctx.runMutation(internal.plans.markPlanAsProfessional, {
        planId: args.planId,
      });
    }
  },
});

In this example a user should not be able to directly call internal.plans.markPlanAsProfessional without going through the upgrade action — if they did, then they would get a free upgrade.

You can define public and internal functions in the same file.

Argument and Return Value Validation
Argument and return value validators ensure that queries, mutations, and actions are called with the correct types of arguments and return the expected types of return values.

This is important for security! Without argument validation, a malicious user can call your public functions with unexpected arguments and cause surprising results. TypeScript alone won't help because TypeScript types aren't present at runtime. We recommend adding argument validation for all public functions in production apps. For non-public functions that are not called by clients, we recommend internal functions and optionally validation.

Example: Argument Validation

Adding validators
To add argument validation to your functions, pass an object with args and handler properties to the query, mutation or action constructor. To add return value validation, use the returns property in this object:

convex/message.ts
TS
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    body: v.string(),
    author: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { body, author } = args;
    await ctx.db.insert("messages", { body, author });
  },
});

If you define your function with an argument validator, there is no need to include TypeScript type annotations! The type of your function will be inferred automatically. Similarly, if you define a return value validator, the return type of your function will be inferred from the validator, and TypeScript will check that it matches the inferred return type of the handler function.

Unlike TypeScript, validation for an object will throw if the object contains properties that are not declared in the validator.

If the client supplies arguments not declared in args, or if the function returns a value that does not match the validator declared in returns. This is helpful to prevent bugs caused by mistyped names of arguments or returning more data than intended to a client.

Even args: {} is a helpful use of validators because TypeScript will show an error on the client if you try to pass any arguments to the function which doesn't expect them.

Supported types
All functions, both public and internal, can accept and return the following data types. Each type has a corresponding validator that can be accessed on the v object imported from "convex/values".

The database can store the exact same set of data types.

Additionally you can also express type unions, literals, any types, and optional fields.

Convex values
Convex supports the following types of values:

Convex Type	TS/JS Type	
Example Usage
Validator for Argument Validation and Schemas	json Format for Export	Notes
Id	Id (string)	doc._id	v.id(tableName)	string	See Document IDs.
Null	null	null	v.null()	null	JavaScript's undefined is not a valid Convex value. Functions the return undefined or do not return will return null when called from a client. Use null instead.
Int64	bigint	3n	v.int64()	string (base10)	Int64s only support BigInts between -2^63 and 2^63-1. Convex supports bigints in most modern browsers.
Float64	number	3.1	v.number()	number / string	Convex supports all IEEE-754 double-precision floating point numbers (such as NaNs). Inf and NaN are JSON serialized as strings.
Boolean	boolean	true	v.boolean()	bool	
String	string	"abc"	v.string()	string	Strings are stored as UTF-8 and must be valid Unicode sequences. Strings must be smaller than the 1MB total size limit when encoded as UTF-8.
Bytes	ArrayBuffer	new ArrayBuffer(8)	v.bytes()	string (base64)	Convex supports first class bytestrings, passed in as ArrayBuffers. Bytestrings must be smaller than the 1MB total size limit for Convex types.
Array	Array	[1, 3.2, "abc"]	v.array(values)	array	Arrays can have at most 8192 values.
Object	Object	{a: "abc"}	v.object({property: value})	object	Convex only supports "plain old JavaScript objects" (objects that do not have a custom prototype). Convex includes all enumerable properties. Objects can have at most 1024 entries. Field names must be nonempty and not start with "$" or "_".
Record	Record	{"a": "1", "b": "2"}	v.record(keys, values)	object	Records are objects at runtime, but can have dynamic keys. Keys must be only ASCII characters, nonempty, and not start with "$" or "_".
Unions
You can describe fields that could be one of multiple types using v.union:

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    stringOrNumber: v.union(v.string(), v.number()),
  },
  handler: async ({ db }, { stringOrNumber }) => {
    //...
  },
});

Literals
Fields that are a constant can be expressed with v.literal. This is especially useful when combined with unions:

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    oneTwoOrThree: v.union(
      v.literal("one"),
      v.literal("two"),
      v.literal("three"),
    ),
  },
  handler: async ({ db }, { oneTwoOrThree }) => {
    //...
  },
});

Record objects
You can describe objects that map arbitrary keys to values with v.record:

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    simpleMapping: v.record(v.string(), v.boolean()),
  },
  handler: async ({ db }, { simpleMapping }) => {
    //...
  },
});

You can use other types of string validators for the keys:

defineTable({
  userIdToValue: v.record(v.id("users"), v.boolean()),
});

Notes:

This type corresponds to the Record<K,V> type in TypeScript
You cannot use string literals as a record key
Using v.string() as a record key validator will only allow ASCII characters
Any
Fields that could take on any value can be represented with v.any():

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    anyValue: v.any(),
  },
  handler: async ({ db }, { anyValue }) => {
    //...
  },
});

This corresponds to the any type in TypeScript.

Optional fields
You can describe optional fields by wrapping their type with v.optional(...):

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    optionalString: v.optional(v.string()),
    optionalNumber: v.optional(v.number()),
  },
  handler: async ({ db }, { optionalString, optionalNumber }) => {
    //...
  },
});

This corresponds to marking fields as optional with ? in TypeScript.

Extracting TypeScript types
The Infer type allows you to turn validator calls into TypeScript types. This can be useful to remove duplication between your validators and TypeScript types:

import { mutation } from "./_generated/server";
import { Infer, v } from "convex/values";

const nestedObject = v.object({
  property: v.string(),
});

// Resolves to `{property: string}`.
export type NestedObject = Infer<typeof nestedObject>;

export default mutation({
  args: {
    nested: nestedObject,
  },
  handler: async ({ db }, { nested }) => {
    //...
  },
});

Runtimes
Convex functions can run in two runtimes:

Default Convex runtime
Opt-in Node.js runtime
Default Convex runtime
All Convex backend functions are written in JavaScript or TypeScript. By default all functions run in a custom JavaScript runtime very similar to the Cloudflare Workers runtime with access to most web standard globals.

The default runtime has many advantages including:

No cold starts. The runtime is always up, and ready to handle any function at a moments notice.
Latest web JavaScript standards. The runtime is based on V8 that also powers Google Chrome. This ensures it provides an interface very similar to your frontend code, allowing further simplification to your code.
Low overhead access to your data. The runtime is designed to have low overhead access to your data via query & mutation functions, allowing you to access your database via a simple JavaScript interface.
Supported APIs
The default runtime supports most npm libraries that work in the browser, Deno, and Cloudflare workers. If your library isn't supported, you can use an action with the Node.js runtime, or reach out in Discord. We are improving support all the time.

Network APIs
Blob
Event
EventTarget
fetch — in Actions only
File
FormData
Headers
Request
Response
Encoding APIs
TextDecoder
TextEncoder
atob
btoa
Web Stream APIs
ReadableStream
ReadableStreamBYOBReader
ReadableStreamDefaultReader
TransformStream
WritableStream
WritableStreamDefaultWriter
Web Crypto APIs
crypto
CryptoKey
SubtleCrypto
Restrictions on queries and mutations
Query and mutation functions are further restricted by the runtime to be deterministic. This allows Convex to automatically retry them by the system as necessary.

Determinism means that no matter how many times your function is run, as long as it is given the same arguments, it will have identical side effects and return the same value.

You don't have to think all that much about maintaining these properties of determinism when you write your Convex functions. Convex will provide helpful error messages as you go, so you can't accidentally do something forbidden.

Using randomness and time in queries and mutations
Convex provides a "seeded" strong pseudo-random number generator at Math.random() so that it can guarantee the determinism of your function. The random number generator's seed is an implicit parameter to your function. Multiple calls to Math.random() in one function call will return different random values. Note that Convex does not reevaluate the Javascript modules on every function run, so a call to Math.random() stored in a global variable will not change between function runs.

To ensure the logic within your function is reproducible, the system time used globally (outside of any function) is "frozen" at deploy time, while the system time during Convex function execution is "frozen" when the function begins. Date.now() will return the same result for the entirety of your function's execution. For example,

const globalRand = Math.random(); // `globalRand` does not change between runs.
const globalNow = Date.now(); // `globalNow` is the time when Convex functions were deployed.

export const updateSomething = mutation({
  args: {},
  handler: () => {
    const now1 = Date.now(); // `now1` is the time when the function execution started.
    const rand1 = Math.random(); // `rand1` has a new value for each function run.
    // implementation
    const now2 = Date.now(); // `now2` === `now1`
    const rand2 = Math.random(); // `rand1` !== `rand2`
  },
});


Actions
Actions are unrestricted by the same rules of determinism as query and mutation functions. Notably actions are allowed to call third-party HTTP endpoints via the browser-standard fetch function.

By default actions also run in Convex’s custom JavaScript runtime with all of its advantages including no cold starts and a browser-like API environment. They can also live in the same file as your query and mutation functions.

Node.js runtime
Some JavaScript and TypeScript libraries use features that are not included in the default Convex runtime. Convex actions provide an escape hatch to Node.js via the "use node" directive at the top of a file that contains your action. Learn more.

Use of the Node.js environment is restricted to action functions only. If you want to use a library designed for Node.js and interact with the Convex database, you need to call the Node.js library from an action, and use runQuery or runMutation helper to call a query or mutation.

Every .ts and .js file in the convex directory is bundled either for the default Convex JavaScript runtime or Node.js, along with any code it imports.

Files with the "use node" directive should not contain any Convex queries or mutations since they cannot be run in the Node.js runtime. Additionally, files without the "use node" directive should not import any files with the "use node" directive. Files that contain no Convex functions, like a convex/utils.ts file, also need the "use node" directive if they use Node.js-specific libraries.

If you encounter bundling errors about Node.js-specific imports like fs / node:fs not being available when deploying convex functions, running npx convex dev --once --debug-node-apis gives more information about these. It uses a slower bundling method to track the train of imports, narrowing down which import is responsible for the error.

Note that argument size limits are lower (5MiB instead of 16MiB).

Node.js version configuration
By default, all actions ran in the Node.js environment are executed in Node.js 18. This version is configurable in the convex.json file. We currently support Node.js 18, 20, and 22.

When pushing a new Node.js version to the server, the new code for your functions may be executed in the old Node.js version for up a few minutes.

Node.js 18 reached its end-of-life on April 30, 2025 and we will no longer support new deployments on it Convex after September 10, 2025. All projects created after this date will be on Node.js 20. All projects that are still on Node.js 18 after October 22, 2025 will automatically be migrated to Node.js 20.

Note: This configuration is not supported when running the self-hosted Convex backend. The node version that is specified in the .nvmrc will be used instead.

Bundling
Bundling is the process of gathering, optimizing and transpiling the JS/TS source code of functions and their dependencies. During development and when deploying, the code is transformed to a format that Convex runtimes can directly and efficiently execute.

Convex currently bundles all dependencies automatically, but for the Node.js runtime you can disable bundling certain packages via the external packages config.

Bundling for Convex
When you push code either via npx convex dev or npx convex deploy, the Convex CLI uses esbuild to traverse your convex/ folder and bundle your functions and all of their used dependencies into a source code bundle. This bundle is then sent to the server.

Thanks to bundling you can write your code using both modern ECMAScript Modules (ESM) or the older CommonJS (CJS) syntax.

ESM vs. CJS
Bundling limitations
The nature of bundling comes with a few limitations.

Code size limits
The total size of your bundled function code in your convex/ folder is limited to 32MiB (~33.55MB). Other platform limits can be found here.

While this limit in itself is quite high for just source code, certain dependencies can quickly make your bundle size cross over this limit, particularly if they are not effectively tree-shakeable (such as aws-sdk or snowflake-sdk)

You can follow these steps to debug bundle size:

Make sure you're using the most recent version of convex
npm install convex@latest

Generate the bundle
Note that this will not push code, and just generated a bundle for debugging purposes.

npx convex dev --once --debug-bundle-path /tmp/myBundle


Visualize the bundle
Use source-map-explorer to visualize your bundle.

npx source-map-explorer /tmp/myBundle/**/*.js

Code bundled for the Convex runtime will be in the isolate directory while code bundled for node actions will be in the node directory.

Large node dependencies can be eliminated from the bundle by marking them as external packages.

Dynamic dependencies
Some libraries rely on dynamic imports (via import/require calls) to avoid always including their dependencies. These imports are not supported by the default Convex runtime and will throw an error at runtime.

Additionally, some libraries rely on local files, which cannot be bundled by esbuild. If bundling is used, irrespective of the choice of runtime, these imports will always fail in Convex.

Examples of libraries with dynamic dependencies
External packages
As a workaround for the bundling limitations above, Convex provides an escape hatch: external packages. This feature is currently exclusive to Convex's Node.js runtime.

External packages use esbuild's facility for marking a dependency as external. This tells esbuild to not bundle the external dependency at all and to leave the import as a dynamic runtime import using require() or import(). Thus, your Convex modules will rely on the underlying system having that dependency made available at execution-time.

Package installation on the server
Packages marked as external are installed from npm the first time you push code that uses them. The version installed matches the version installed in the node_modules folder on your local machine.

While this comes with a latency penalty the first time you push external packages, your packages are cached and this install step only ever needs to rerun if your external packages change. Once cached, pushes can actually be faster due to smaller source code bundles being sent to the server during pushes!

Specifying external packages
Create a convex.json file in the same directory as your package.json if it does not exist already. Set the node.externalPackages field to ["*"] to mark all dependencies used within your Node actions as external:

{
  "node": {
    "externalPackages": ["*"]
  }
}

Alternatively, you can explicitly specify which packages to mark as external:

{
  "node": {
    "externalPackages": ["aws-sdk", "sharp"]
  }
}

The package identifiers should match the string used in import/require in your Node.js action.

Troubleshooting external packages
Incorrect package versions
The Convex CLI searches for external packages within your local node_modules directory. Thus, changing version of a package in the package.json will not affect the version used on the server until you've updated the package version installed in your local node_modules folder (e.g. running npm install).

Import errors
Marking a dependency as external may result in errors like this:

The requested module "some-module" is a CommonJs module, which may not support all module.exports as named exports. CommonJs modules can always be imported via the default export

This requires rewriting any imports for this module as follows:

// ❌ old
import { Foo } from "some-module";

// ✅ new
import SomeModule from "some-module";
const { Foo } = SomeModule;

Limitations
The total size of your source code bundle and external packages cannot exceed the following:

45MB zipped
240MB unzipped
Packages that are known not to work at this time:

Puppeteer - browser binary installation exceeds the size limit
@ffmpeg.wasm - since 0.12.0, no longer supports Node environments

Debugging
Debugging is the process of figuring out why your code isn't behaving as you expect.

Debugging during development
During development the built-in console API allows you to understand what's going on inside your functions:

convex/myFunctions.ts
TS
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const mutateSomething = mutation({
  args: { a: v.number(), b: v.number() },
  handler: (_, args) => {
    console.log("Received args", args);
    // ...
  },
});

The following methods are available in the default Convex runtime:

Logging values, with a specified severity level:
console.log
console.info
console.warn
console.error
console.debug
Logging with a stack trace:
console.trace
Measuring execution time:
console.time
console.timeLog
console.timeEnd
The Convex backend also automatically logs all successful function executions and all errors thrown by your functions.

You can view these logs:

When using the ConvexReactClient, in your browser developer tools console pane. The logs are sent from your dev deployment to your client, and the client logs them to the browser. Production deployments do not send logs to the client.
In your Convex dashboard on the Logs page.
In your terminal with npx convex dev during development or npx convex logs, which only prints logs.
Using a debugger
You can exercise your functions from tests, in which case you can add debugger; statements and step through your code. See Testing.

Debugging in production
When debugging an issue in production your options are:

Leverage existing logging
Add more logging and deploy a new version of your backend to production
Convex backend currently only preserves a limited number of logs, and logs can be erased at any time when the Convex team performs internal maintenance and upgrades. You should therefore set up log streaming and error reporting integrations to enable your team easy access to historical logs and additional information logged by your client.

Finding relevant logs by Request ID
To find the appropriate logs for an error you or your users experience, Convex includes a Request ID in all exception messages in both dev and prod in this format: [Request ID: <request_id>].

You can copy and paste a Request ID into your Convex dashboard to view the logs for functions started by that request. See the Dashboard logs page for details.