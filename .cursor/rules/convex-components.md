Components
Convex Components package up code and data in a sandbox that allows you to confidently and quickly add new features to your backend.

Convex Components are like mini self-contained Convex backends, and installing them is always safe. They can't read your app's tables or call your app's functions unless you pass them in explicitly.

You can read about the full vision in Convex: The Software-Defined Database

The Convex team has built a few components that add new features to your backend. You'll eventually be able to author your own components to use within your project and to share with the community, but we haven't stabilized and documented the authoring APIs yet.

Each component is installed as its own independent library from NPM. Check out the component's README for installation and usage instructions. You can see the full directory on the Convex website.

Using Components
Convex components add new features to your backend in their own sandbox with their own functions, schema and data, scheduled functions and all other fundamental Convex features.

You can see the full list of components in the directory. Each component README provides full instructions on how to install and use them.

This doc will go through common patterns on how to install and use Components.

Installing Components
We'll use the Sharded Counter component as an example.

Install from `npm`
Install the relevant package from npm

npm i @convex-dev/sharded-counter

Add the component to your app
Create or update the convex.config.ts file in your app's convex/ folder and install the component by calling use:

// convex/convex.config.ts
import { defineApp } from "convex/server";
import shardedCounter from "@convex-dev/sharded-counter/convex.config";

const app = defineApp();

app.use(shardedCounter);
//... Add other components here

export default app;


Run convex dev
Make sure the convex dev cli is running to ensure the component is registered with your backend and the necessary code is generated.

npx convex dev

Use the provided component API
Each component has its own API. Check out each component's README file for more details on its usage.

Component functions
Though components may expose higher level TypeScript APIs, under the hood they are called via normal Convex functions over the component sandbox boundary.

Queries, mutations, and action rules still apply - queries can only call component queries, mutations can also call component mutations, and actions can also call component actions. As a result, queries into components are reactive by default, and mutations have the same transaction guarantees.

Transactions
Remember that mutation functions in Convex are transactions. Either all the changes in the mutation get written at once or none are written at all.

All writes for a top-level mutation call, including writes performed by calls into other components' mutations, are committed at the same time. If the top-level mutation throws an error, all of the writes are rolled back, and the mutation doesn't change the database at all.

However, if a component mutation call throws an exception, only its writes are rolled back. Then, if the caller catches the exception, it can continue, perform more writes, and return successfully. If the caller doesn't catch the exception, then it's treated as failed and all the writes associated with the caller mutation are rolled back. This means your code can choose a different code path depending on the semantics of your component.

As an example, take the Rate Limiter component. One API of the Rate Limiter throws an error if a rate limit is hit:

// Automatically throw an error if the rate limit is hit.
await rateLimiter.limit(ctx, "failedLogins", { key: userId, throws: true });


If the call to rateLimiter.limit throws an exception, we're over the rate limit. Then, if the calling mutation doesn't catch this exception, the whole transaction is rolled back.

The calling mutation, on the other hand, could also decide to ignore the rate limit by catching the exception and proceeding. For example, an app may want to ignore rate limits if there is a development environment override. In this case, only the component mutation will be rolled back, and the rest of the mutation will continue.

Dashboard
You can see your component’s data, functions, files, and other info using the dropdown in the Dashboard.