Authentication
Convex deployment endpoints are exposed to the open internet and the claims clients make about who they are must be authenticated to identify users and restrict what data they can see and edit.

Convex is compatible with most authentication providers because it uses OpenID Connect (based on OAuth) ID tokens in the form of JWTs to authenticate WebSocket connections or RPCs. These JWTs can be provided by any service (including your own Convex backend) that implement the appropriate OAuth endpoints to verify them.

Third-party authentication platforms
Leveraging a Convex integration with a third-party auth provider provides the most comprehensive authentication solutions. Integrating another service provides a ton of functionality like passkeys, two-factor auth, spam protection, and more on top of the authentication basics.

Clerk has great Next.js and React Native support
WorkOS AuthKit is built for B2B apps and free for up to 1M users
Auth0 is more established with more bells and whistles
Custom Auth Integration allow any OpenID Connect-compatible identity provider to be used for authentication
After you integrate one of these, learn more about accessing authentication information in Functions and storing user information in the Database.

The Convex Auth Library
For client-side React and React Native mobile apps you can implement auth directly in Convex with the Convex Auth library. This npm package runs on your Convex deployment and helps you build a custom sign-up/sign-in flow via social identity providers, one-time email or SMS access codes, or via passwords.

Convex Auth is in beta (it isn't complete and may change in backward-incompatible ways) and doesn't provide as many features as third party auth integrations. Since it doesn't require signing up for another service it's the quickest way to get auth up and running.

Convex Auth is in beta
Convex Auth is currently a beta feature. If you have feedback or feature requests, let us know on Discord!

Support for Next.js is under active development. If you'd like to help test this experimental support please give it a try!

Debugging
If you run into issues consult the Debugging guide.

Service Authentication
Servers you control or third party services can call Convex functions but may not be able to obtain OpenID JWTs and often do not represent the actions of a specific user.

Say you're running some inference on a Modal server written in Python. When that server subscribes to a Convex query it doesn't do so with credentials of a particular end-user, rather it's looking for relevant tasks for any users that need that inference task, say summarizing and translating a conversation, completed.

To provide access to Convex queries, mutations, and actions to an external service you can write public functions accessible to the internet that check a shared secret, for example from an environment variable, before doing anything else.

Authorization
Convex enables a traditional three tier application structure: a client/UI for your app, a backend that handles user requests, and a database for queries. This architecture lets you check every public request against any authorization rules you can define in code.

This means Convex doesn't need an opinionated authorization framework like RLS, which is required in client oriented databases like Firebase or Supabase. This flexibility lets you build and use an authorization framework for your needs.

That said, the most common way is to simply write code that checks if the user is logged in and if they are allowed to do the requested action at the beginning of each public function.

For example, the following function enforces that only the currently authenticated user can remove their own user image:

export const removeUserImage = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    ctx.db.patch(userId, { imageId: undefined, image: undefined });
  },
});

Convex Auth
Convex Auth is a library for implementing authentication directly within your Convex backend. This allows you to authenticate users without needing an authentication service or even a hosting server. Convex Auth currently supports client-side React web apps served from a CDN and React Native mobile apps.

Example: Live Demo (Source)

Convex Auth is in beta
Convex Auth is currently a beta feature. If you have feedback or feature requests, let us know on Discord!

Support for authentication in Next.js server components, API routes, middleware, SSR etc. is under active development. If you'd like to help test this experimental support please let us know how it goes in Discord.

Get Started
To start a new project from scratch with Convex and Convex Auth, run:

npm create convex@latest

and choose React (Vite) and Convex Auth.

To add Convex Auth to an existing project, follow the full setup guide.

Overview
Convex Auth enables you to implement the following authentication methods:

Magic Links & OTPs - send a link or code via email
OAuth - sign in with GitHub / Google / Apple etc.
Passwords - including password reset flow and optional email verification
The library doesn't come with UI components, but you can copy code from the docs and example repo to quickly build a UI in React.

Learn more in the Convex Auth docs.

Convex & Clerk
Clerk is an authentication platform providing login via passwords, social identity providers, one-time email or SMS access codes, and multi-factor authentication and user management.

Get started
Convex offers a provider that is specifically for integrating with Clerk called <ConvexProviderWithClerk>. It works with any of Clerk's React-based SDKs, such as the Next.js and Expo SDKs.

See the following sections for the Clerk SDK that you're using:

React - Use this as a starting point if your SDK is not listed
Next.js
Tanstack Start
React
Example: React with Convex and Clerk

This guide assumes you already have a working React app with Convex. If not follow the Convex React Quickstart first. Then:

Sign up for Clerk
Sign up for a free Clerk account at clerk.com/sign-up.

Sign up to Clerk

Create an application in Clerk
Choose how you want your users to sign in.

Create a Clerk application

Create a JWT Template
In the Clerk Dashboard, navigate to the JWT templates page.

Select New template and then from the list of templates, select Convex. You'll be redirected to the template's settings page. Do NOT rename the JWT token. It must be called convex.

Copy and save the Issuer URL somewhere secure. This URL is the issuer domain for Clerk's JWT templates, which is your Clerk app's Frontend API URL. In development, it's format will be https://verb-noun-00.clerk.accounts.dev. In production, it's format will be https://clerk.<your-domain>.com.

Create a JWT template

Configure Convex with the Clerk issuer domain
In your app's convex folder, create a new file auth.config.ts with the following code. This is the server-side configuration for validating access tokens.

convex/auth.config.ts
TS
export default {
  providers: [
    {
      // Replace with your own Clerk Issuer URL from your "convex" JWT template
      // or with `process.env.CLERK_JWT_ISSUER_DOMAIN`
      // and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ]
};


Deploy your changes
Run npx convex dev to automatically sync your configuration to your backend.

npx convex dev

Install clerk
In a new terminal window, install the Clerk React SDK:

npm install @clerk/clerk-react

Set your Clerk API keys
In the Clerk Dashboard, navigate to the API keys page. In the Quick Copy section, copy your Clerk Publishable Key and set it as the CLERK_PUBLISHABLE_KEY environment variable. If you're using Vite, you will need to prefix it with VITE_.

.env
VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY

Configure ConvexProviderWithClerk
Both Clerk and Convex have provider components that are required to provide authentication and client context.

You should already have <ConvexProvider> wrapping your app. Replace it with <ConvexProviderWithClerk>, and pass Clerk's useAuth() hook to it.

Then, wrap it with <ClerkProvider>. <ClerkProvider> requires a publishableKey prop, which you can set to the VITE_CLERK_PUBLISHABLE_KEY environment variable.

src/main.tsx
TS
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey="pk_test_...">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </React.StrictMode>,
);


Show UI based on authentication state
You can control which UI is shown when the user is signed in or signed out using Convex's <Authenticated>, <Unauthenticated> and <AuthLoading> helper components. These should be used instead of Clerk's <SignedIn>, <SignedOut> and <ClerkLoading> components, respectively.

It's important to use the useConvexAuth() hook instead of Clerk's useAuth() hook when you need to check whether the user is logged in or not. The useConvexAuth() hook makes sure that the browser has fetched the auth token needed to make authenticated requests to your Convex backend, and that the Convex backend has validated it.

In the following example, the <Content /> component is a child of <Authenticated>, so its content and any of its child components are guaranteed to have an authenticated user, and Convex queries can require authentication.

src/App.tsx
TS
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function App() {
  return (
    <main>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <Authenticated>
        <UserButton />
        <Content />
      </Authenticated>
      <AuthLoading>
        <p>Still loading</p>
      </AuthLoading>
    </main>
  );
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser);
  return <div>Authenticated content: {messages?.length}</div>;
}

export default App;


Use authentication state in your Convex functions
If the client is authenticated, you can access the information stored in the JWT via ctx.auth.getUserIdentity.

If the client isn't authenticated, ctx.auth.getUserIdentity will return null.

Make sure that the component calling this query is a child of <Authenticated> from convex/react. Otherwise, it will throw on page load.

convex/messages.ts
TS
import { query } from "./_generated/server";

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("author"), identity.email))
      .collect();
  },
});


Next.js
Example: Next.js with Convex and Clerk

This guide assumes you already have a working Next.js app with Convex. If not follow the Convex Next.js Quickstart first. Then:

Sign up for Clerk
Sign up for a free Clerk account at clerk.com/sign-up.

Sign up to Clerk

Create an application in Clerk
Choose how you want your users to sign in.

Create a Clerk application

Create a JWT Template
In the Clerk Dashboard, navigate to the JWT templates page.

Select New template and then from the list of templates, select Convex. You'll be redirected to the template's settings page. Do NOT rename the JWT token. It must be called convex.

Copy and save the Issuer URL somewhere secure. This URL is the issuer domain for Clerk's JWT templates, which is your Clerk app's Frontend API URL. In development, it's format will be https://verb-noun-00.clerk.accounts.dev. In production, it's format will be https://clerk.<your-domain>.com.

Create a JWT template

Configure Convex with the Clerk issuer domain
In your app's convex folder, create a new file auth.config.ts with the following code. This is the server-side configuration for validating access tokens.

convex/auth.config.ts
TS
export default {
  providers: [
    {
      // Replace with your own Clerk Issuer URL from your "convex" JWT template
      // or with `process.env.CLERK_JWT_ISSUER_DOMAIN`
      // and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ]
};


Deploy your changes
Run npx convex dev to automatically sync your configuration to your backend.

npx convex dev

Install clerk
In a new terminal window, install the Clerk Next.js SDK:

npm install @clerk/nextjs

Set your Clerk API keys
In the Clerk Dashboard, navigate to the API keys page. In the Quick Copy section, copy your Clerk Publishable and Secret Keys and set them as the NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY environment variables, respectively.

.env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY


Add Clerk middleware
Clerk's clerkMiddleware() helper grants you access to user authentication state throughout your app.

Create a middleware.ts file.

In your middleware.ts file, export the clerkMiddleware() helper:

import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}


By default, clerkMiddleware() will not protect any routes. All routes are public and you must opt-in to protection for routes.https://clerk.com/docs/references/nextjs/clerk-middleware) to learn how to require authentication for specific routes.

Configure ConvexProviderWithClerk
Both Clerk and Convex have provider components that are required to provide authentication and client context.

Typically, you'd replace <ConvexProvider> with <ConvexProviderWithClerk>, but with Next.js App Router, things are a bit more complex.

<ConvexProviderWithClerk> calls ConvexReactClient() to get Convex's client, so it must be used in a Client Component. Your app/layout.tsx, where you would use <ConvexProviderWithClerk>, is a Server Component, and a Server Component cannot contain Client Component code. To solve this, you must first create a wrapper Client Component around <ConvexProviderWithClerk>.

'use client'

import { ReactNode } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useAuth } from '@clerk/nextjs'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}


Wrap your app in Clerk and Convex
Now, your Server Component, app/layout.tsx, can render <ConvexClientProvider> instead of rendering <ConvexProviderWithClerk> directly. It's important that <ClerkProvider> wraps <ConvexClientProvider>, and not the other way around, as Convex needs to be able to access the Clerk context.

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from '@/components/ConvexClientProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Clerk Next.js Quickstart',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}


Show UI based on authentication state
You can control which UI is shown when the user is signed in or signed out using Convex's <Authenticated>, <Unauthenticated> and <AuthLoading> helper components. These should be used instead of Clerk's <SignedIn>, <SignedOut> and <ClerkLoading> components, respectively.

It's important to use the useConvexAuth() hook instead of Clerk's useAuth() hook when you need to check whether the user is logged in or not. The useConvexAuth() hook makes sure that the browser has fetched the auth token needed to make authenticated requests to your Convex backend, and that the Convex backend has validated it.

In the following example, the <Content /> component is a child of <Authenticated>, so its content and any of its child components are guaranteed to have an authenticated user, and Convex queries can require authentication.

app/page.tsx
TS
"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {
  return (
    <>
      <Authenticated>
        <UserButton />
        <Content />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </>
  );
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser);
  return <div>Authenticated content: {messages?.length}</div>;
}


Use authentication state in your Convex functions
If the client is authenticated, you can access the information stored in the JWT via ctx.auth.getUserIdentity.

If the client isn't authenticated, ctx.auth.getUserIdentity will return null.

Make sure that the component calling this query is a child of <Authenticated> from convex/react. Otherwise, it will throw on page load.

convex/messages.ts
TS
import { query } from "./_generated/server";

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("author"), identity.email))
      .collect();
  },
});


Tanstack Start
Example: Tanstack Start with Convex and Clerk

See the Tanstack Start with Clerk guide for more information.

Next steps
Accessing user information in functions
See Auth in Functions to learn about how to access information about the authenticated user in your queries, mutations and actions.

See Storing Users in the Convex Database to learn about how to store user information in the Convex database.

Accessing user information client-side
To access the authenticated user's information, use Clerk's User object, which can be accessed using Clerk's useUser() hook. For more information on the User object, see the Clerk docs.

components/Badge.tsx
TS
export default function Badge() {
  const { user } = useUser();

  return <span>Logged in as {user.fullName}</span>;
}

Configuring dev and prod instances
To configure a different Clerk instance between your Convex development and production deployments, you can use environment variables configured on the Convex dashboard.

Configuring the backend
In the Clerk Dashboard, navigate to the API keys page. Copy your Clerk Frontend API URL. This URL is the issuer domain for Clerk's JWT templates, and is necessary for Convex to validate access tokens. In development, it's format will be https://verb-noun-00.clerk.accounts.dev. In production, it's format will be https://clerk.<your-domain>.com.

Paste your Clerk Frontend API URL into your .env file, set it as the CLERK_JWT_ISSUER_DOMAIN environment variable.

.env
CLERK_JWT_ISSUER_DOMAIN=https://verb-noun-00.clerk.accounts.dev

Then, update your auth.config.ts file to use the environment variable.

convex/auth.config.ts
TS
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};

Development configuration

In the left sidenav of the Convex dashboard, switch to your development deployment and set the values for your development Clerk instance.

Convex dashboard dev deployment settings

Then, to switch your deployment to the new configuration, run npx convex dev.

Production configuration

In the left sidenav of the Convex dashboard, switch to your production deployment and set the values for your production Clerk instance.

Then, to switch your deployment to the new configuration, run npx convex deploy.

Configuring Clerk's API keys
Clerk's API keys differ depending on whether they are for development or production. Don't forget to update the environment variables in your .env file as well as your hosting platform, such as Vercel or Netlify.

Development configuration

Clerk's Publishable Key for development follows the format pk_test_....

.env.local
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."

Production configuration

Clerk's Publishable Key for production follows the format pk_live_....

.env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."

Debugging authentication
If a user goes through the Clerk login flow successfully, and after being redirected back to your page, useConvexAuth() returns isAuthenticated: false, it's possible that your backend isn't correctly configured.

The auth.config.ts file contains a list of configured authentication providers. You must run npx convex dev or npx convex deploy after adding a new provider to sync the configuration to your backend.

For more thorough debugging steps, see Debugging Authentication.

Under the hood
The authentication flow looks like this under the hood:

The user clicks a login button
The user is redirected to a page where they log in via whatever method you configure in Clerk
After a successful login Clerk redirects back to your page, or a different page which you configure via the afterSignIn prop.
The ClerkProvider now knows that the user is authenticated.
The ConvexProviderWithClerk fetches an auth token from Clerk.
The ConvexReactClient passes this token down to your Convex backend to validate
Your Convex backend retrieves the public key from Clerk to check that the token's signature is valid.
The ConvexReactClient is notified of successful authentication, and ConvexProviderWithClerk now knows that the user is authenticated with Convex. useConvexAuth returns isAuthenticated: true and the Authenticated component renders its children.
ConvexProviderWithClerk takes care of refetching the token when needed to make sure the user stays authenticated with your backend.

Convex & Auth0
Auth0 is an authentication platform providing login via passwords, social identity providers, one-time email or SMS access codes, multi-factor authentication, and single sign on and basic user management.

Example: Convex Authentication with Auth0

If you're using Next.js see the Next.js setup guide.

Get started
This guide assumes you already have a working React app with Convex. If not follow the Convex React Quickstart first. Then:

Follow the Auth0 React quickstart
Follow the Auth0 React Quickstart.

Sign up for a free Auth0 account.

Configure your application, using http://localhost:3000, http://localhost:5173 for Callback and Logout URLs and Allowed Web Origins.

Come back when you finish the Install the Auth0 React SDK step.

Sign up to Auth0

Create the auth config
In the convex folder create a new file auth.config.ts with the server-side configuration for validating access tokens.

Paste in the domain and clientId values shown in Install the Auth0 React SDK step of the Auth0 quickstart or in your Auth0 application's Settings dashboard.

convex/auth.config.ts
TS
export default {
  providers: [
    {
      domain: "your-domain.us.auth0.com",
      applicationID: "yourclientid",
    },
  ]
};

Deploy your changes
Run npx convex dev to automatically sync your configuration to your backend.

npx convex dev

Configure ConvexProviderWithAuth0
Now replace your ConvexProvider with an Auth0Provider wrapping ConvexProviderWithAuth0. Add the domain and clientId as props to the Auth0Provider.

Paste in the domain and clientId values shown in Install the Auth0 React SDK step of the Auth0 quickstart or in your Auth0 application's Settings dashboard as props to Auth0Provider.

src/main.tsx
TS
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import { Auth0Provider } from "@auth0/auth0-react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain="your-domain.us.auth0.com"
      clientId="yourclientid"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <ConvexProviderWithAuth0 client={convex}>
        <App />
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  </React.StrictMode>,
);


Login and logout flows
Now that you have everything set up, you can use the useAuth0() hook to create login and logout buttons for your app.

The login button will redirect the user to the Auth0 universal login page. For details see Add Login to Your Application in the Auth0 React Quickstart.

src/login.ts
TS
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton() {
  const { loginWithRedirect } = useAuth0();
  return <button onClick={loginWithRedirect}>Log in</button>;
}

The logout button will redirect the user to the Auth0 logout endpoint. For details see Add Logout to your Application in the Auth0 React Quickstart.

src/logout.ts
TS
import { useAuth0 } from "@auth0/auth0-react";

export default function LogoutButton() {
  const { logout } = useAuth0();
  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log out
    </button>
  );
}

Logged-in and logged-out views
Use the useConvexAuth() hook instead of the useAuth0 hook when you need to check whether the user is logged in or not. The useConvex hook makes sure that the browser has fetched the auth token needed to make authenticated requests to your Convex backend:

src/App.ts
TS
import { useConvexAuth } from "convex/react";

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  return (
    <div className="App">
      {isAuthenticated ? "Logged in" : "Logged out or still loading"}
    </div>
  );
}

You can also use the Authenticated, Unauthenticated and AuthLoading helper components which use the useConvexAuth hook under the hood:

src/App.ts
TS
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

function App() {
  return (
    <div className="App">
      <Authenticated>Logged in</Authenticated>
      <Unauthenticated>Logged out</Unauthenticated>
      <AuthLoading>Still loading</AuthLoading>
    </div>
  );
}


User information in React
You can access information about the authenticated user like their name from the useAuth0 hook:

src/badge.ts
TS
import { useAuth0 } from "@auth0/auth0-react";

export default function Badge() {
  const { user } = useAuth0();
  return <span>Logged in as {user.name}</span>;
}

User information in functions
See Auth in Functions to learn about how to access information about the authenticated user in your queries, mutations and actions.

See Storing Users in the Convex Database to learn about how to store user information in the Convex database.

Configuring dev and prod tenants
To configure a different Auth0 tenant (environment) between your Convex development and production deployments you can use environment variables configured on the Convex dashboard.

Configuring the backend
First, change your auth.config.ts file to use environment variables:

convex/auth.config.ts
TS
export default {
  providers: [
    {
      domain: process.env.AUTH0_DOMAIN,
      applicationID: process.env.AUTH0_CLIENT_ID,
    },
  ],
};

Development configuration

Open the Settings for your dev deployment on the Convex dashboard and add the variables there:

Convex dashboard dev deployment settings

Now switch to the new configuration by running npx convex dev.

Production configuration

Similarly on the Convex dashboard switch to your production deployment in the left side menu and set the values for your production Auth0 tenant there.

Now switch to the new configuration by running npx convex deploy.

Configuring a React client
To configure your client you can use environment variables as well. The exact name of the environment variables and the way to refer to them depends on each client platform (Vite vs Next.js etc.), refer to our corresponding Quickstart or the relevant documentation for the platform you're using.

Change the props to Auth0Provider to take in environment variables:

src/main.tsx
TS
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import { Auth0Provider } from "@auth0/auth0-react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <ConvexProviderWithAuth0 client={convex}>
        <App />
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  </React.StrictMode>,
);


Development configuration

Use the .env.local or .env file to configure your client when running locally. The name of the environment variables file depends on each client platform (Vite vs Next.js etc.), refer to our corresponding Quickstart or the relevant documentation for the platform you're using:

.env.local
VITE_AUTH0_DOMAIN="your-domain.us.auth0.com"
VITE_AUTH0_CLIENT_ID="yourclientid"

Production configuration

Set the environment variables in your production environment depending on your hosting platform. See Hosting.

Debugging authentication
If a user goes through the Auth0 login flow successfully, and after being redirected back to your page useConvexAuth gives isAuthenticated: false, it's possible that your backend isn't correctly configured.

The auth.config.ts file in your convex/ directory contains a list of configured authentication providers. You must run npx convex dev or npx convex deploy after adding a new provider to sync the configuration to your backend.

For more thorough debugging steps, see Debugging Authentication.

Under the hood
The authentication flow looks like this under the hood:

The user clicks a login button
The user is redirected to a page where they log in via whatever method you configure in Auth0
After a successful login Auth0 redirects back to your page, or a different page which you configure via the authorizationParams prop.
The Auth0Provider now knows that the user is authenticated.
The ConvexProviderWithAuth0 fetches an auth token from Auth0.
The ConvexReactClient passes this token down to your Convex backend to validate
Your Convex backend retrieves the public key from Auth0 to check that the token's signature is valid.
The ConvexReactClient is notified of successful authentication, and ConvexProviderWithAuth0 now knows that the user is authenticated with Convex. useConvexAuth returns isAuthenticated: true and the Authenticated component renders its children.
ConvexProviderWithAuth0 takes care of refetching the token when needed to make sure the user stays authenticated with your backend.

Auth in Functions
If you're using Convex Auth, see the authorization doc.

Within a Convex function, you can access information about the currently logged-in user by using the auth property of the QueryCtx, MutationCtx, or ActionCtx object:

convex/myFunctions.ts
TS
import { mutation } from "./_generated/server";

export const myMutation = mutation({
  args: {
    // ...
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Unauthenticated call to mutation");
    }
    //...
  },
});

User identity fields
The UserIdentity object returned by getUserIdentity is guaranteed to have tokenIdentifier, subject and issuer fields. Which other fields it will include depends on the identity provider used and the configuration of JWT tokens and OpenID scopes.

tokenIdentifier is a combination of subject and issuer to ensure uniqueness even when multiple providers are used.

If you followed one of our integrations with Clerk or Auth0 at least the following fields will be present: familyName, givenName, nickname, pictureUrl, updatedAt, email, emailVerified. See their corresponding standard definition in the OpenID docs.

convex/myFunctions.ts
TS
import { mutation } from "./_generated/server";

export const myMutation = mutation({
  args: {
    // ...
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const { tokenIdentifier, name, email } = identity!;
    //...
  },
});

Clerk claims configuration
If you're using Clerk, the fields returned by getUserIdentity are determined by your JWT template's Claims config. If you've set custom claims, they will be returned by getUserIdentity as well.

Custom JWT Auth
If you're using Custom JWT auth instead of OpenID standard fields you'll find each nested field available at dot-containing-string field names like identity["properties.email"].

HTTP Actions
You can also access the user identity from an HTTP action ctx.auth.getUserIdentity(), by calling your endpoint with an Authorization header including a JWT token:

myPage.ts
TS
const jwtToken = "...";

fetch("https://<deployment name>.convex.site/myAction", {
  headers: {
    Authorization: `Bearer ${jwtToken}`,
  },
});

Storing Users in the Convex Database
If you're using Convex Auth the user information is already stored in your database. There's nothing else you need to implement.

You might want to store user information directly in your Convex database, for the following reasons:

Your functions need information about other users, not just about the currently logged-in user
Your functions need access to information other than the fields available in the Open ID Connect JWT
There are two ways you can choose from for storing user information in your database (but only the second one allows storing information not contained in the JWT):

Have your app's client call a mutation that stores the information from the JWT available on ctx.auth
Implement a webhook and have your identity provider call it whenever user information changes
Call a mutation from the client
Example: Convex Authentication with Clerk

(optional) Users table schema
You can define a "users" table, optionally with an index for efficient looking up the users in the database.

In the examples below we will use the tokenIdentifier from the ctx.auth.getUserIdentity() to identify the user, but you could use the subject field (which is usually set to the unique user ID from your auth provider) or even email, if your authentication provider provides email verification and you have it enabled.

Which field you use will determine how multiple providers interact, and how hard it will be to migrate to a different provider.

convex/schema.ts
users: defineTable({
  name: v.string(),
  tokenIdentifier: v.string(),
}).index("by_token", ["tokenIdentifier"]),

Mutation for storing current user
This is an example of a mutation that stores the user's name and tokenIdentifier:

convex/users.ts
TS
import { mutation } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    // Note: If you don't want to define an index right away, you can use
    // ctx.db.query("users")
    //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
    //  .unique();
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch the value.
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      return user._id;
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});


Calling the store user mutation from React
You can call this mutation when the user logs in from a useEffect hook. After the mutation succeeds you can update local state to reflect that the user has been stored.

This helper hook that does the job:

src/useStoreUserEffect.ts
TS
import { useUser } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export function useStoreUserEffect() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  // When this state is set we know the server
  // has stored the user.
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const storeUser = useMutation(api.users.store);
  // Call the `storeUser` mutation function to store
  // the current user in the `users` table and return the `Id` value.
  useEffect(() => {
    // If the user is not logged in don't do anything
    if (!isAuthenticated) {
      return;
    }
    // Store the user in the database.
    // Recall that `storeUser` gets the user information via the `auth`
    // object on the server. You don't need to pass anything manually here.
    async function createUser() {
      const id = await storeUser();
      setUserId(id);
    }
    createUser();
    return () => setUserId(null);
    // Make sure the effect reruns if the user logs in with
    // a different identity
  }, [isAuthenticated, storeUser, user?.id]);
  // Combine the local state with the state from context
  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
  };
}


You can use this hook in your top-level component. If your queries need the user document to be present, make sure that you only render the components that call them after the user has been stored:

src/App.tsx
TS
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useStoreUserEffect } from "./useStoreUserEffect.js";

function App() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();
  return (
    <main>
      {isLoading ? (
        <>Loading...</>
      ) : !isAuthenticated ? (
        <SignInButton />
      ) : (
        <>
          <UserButton />
          <Content />
        </>
      )}
    </main>
  );
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser);
  return <div>Authenticated content: {messages?.length}</div>;
}

export default App;

In this way the useStoreUserEffect hook replaces the useConvexAuth hook.

Using the current user's document ID
Similarly to the store user mutation, you can retrieve the current user's ID, or throw an error if the user hasn't been stored.

Now that you have users stored as documents in your Convex database, you can use their IDs as foreign keys in other documents:

convex/messages.ts
TS
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthenticated call to mutation");
    }
    await ctx.db.insert("messages", { body: args.body, user: user._id });
  },
});
    // do something with `user`...
}
});


Loading users by their ID
The information about other users can be retrieved via their IDs:

convex/messages.ts
TS
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    return Promise.all(
      messages.map(async (message) => {
        // For each message in this channel, fetch the `User` who wrote it and
        // insert their name into the `author` field.
        const user = await ctx.db.get(message.user);
        return {
          author: user?.name ?? "Anonymous",
          ...message,
        };
      }),
    );
  },
});


Set up webhooks
This guide will use Clerk, but Auth0 can be set up similarly via Auth0 Actions.

With this implementation Clerk will call your Convex backend via an HTTP endpoint any time a user signs up, updates or deletes their account.

Example: Convex Authentication with Clerk and Webhooks

Configure the webhook endpoint in Clerk
On your Clerk dashboard, go to Webhooks, click on + Add Endpoint.

Set Endpoint URL to https://<your deployment name>.convex.site/clerk-users-webhook (note the domain ends in .site, not .cloud). You can see your deployment name in the .env.local file in your project directory, or on your Convex dashboard as part of the Deployment URL. For example, the endpoint URL could be: https://happy-horse-123.convex.site/clerk-users-webhook.

In Message Filtering, select user for all user events (scroll down or use the search input).

Click on Create.

After the endpoint is saved, copy the Signing Secret (on the right side of the UI), it should start with whsec_. Set it as the value of the CLERK_WEBHOOK_SECRET environment variable in your Convex dashboard.

(optional) Users table schema
You can define a "users" table, optionally with an index for efficient looking up the users in the database.

In the examples below we will use the subject from the ctx.auth.getUserIdentity() to identify the user, which should be set to the Clerk user ID.

convex/schema.ts
users: defineTable({
  name: v.string(),
  // this the Clerk ID, stored in the subject JWT field
  externalId: v.string(),
}).index("byExternalId", ["externalId"]),

Mutations for upserting and deleting users
This is an example of mutations that handle the updates received via the webhook:

convex/users.ts
TS
import { internalMutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}


There are also a few helpers in this file:

current exposes the user information to the client, which will helps the client determine whether the webhook already succeeded
upsertFromClerk will be called when a user signs up or when they update their account
deleteFromClerk will be called when a user deletes their account via Clerk UI from your app
getCurrentUserOrThrow retrieves the currently logged-in user or throws an error
getCurrentUser retrieves the currently logged-in user or returns null
userByExternalId retrieves a user given the Clerk ID, and is used only for retrieving the current user or when updating an existing user via the webhook
Webhook endpoint implementation
This how the actual HTTP endpoint can be implemented:

convex/http.ts
TS
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occured", { status: 400 });
    }
    switch (event.type) {
      case "user.created": // intentional fallthrough
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;

      case "user.deleted": {
        const clerkUserId = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }
      default:
        console.log("Ignored Clerk webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;


If you deploy your code now and sign in, you should see the user being created in your Convex database.

Using the current user's document
You can use the helpers defined before to retrieve the current user's document.

Now that you have users stored as documents in your Convex database, you can use their IDs as foreign keys in other documents:

convex/messages.ts
TS
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ctx.db.insert("messages", { body: args.body, userId: user._id });
  },
});


Loading users by their ID
The information about other users can be retrieved via their IDs:

convex/messages.ts
TS
export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    return Promise.all(
      messages.map(async (message) => {
        // For each message in this channel, fetch the `User` who wrote it and
        // insert their name into the `author` field.
        const user = await ctx.db.get(message.user);
        return {
          author: user?.name ?? "Anonymous",
          ...message,
        };
      }),
    );
  },
});


Waiting for current user to be stored
If you want to use the current user's document in a query, make sure that the user has already been stored. You can do this by explicitly checking for this condition before rendering the components that call the query, or before redirecting to the authenticated portion of your app.

For example you can define a hook that determines the current authentication state of the client, taking into account whether the current user has been stored:

src/useCurrentUser.ts
TS
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function useCurrentUser() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.current);
  // Combine the authentication state with the user existence check
  return {
    isLoading: isLoading || (isAuthenticated && user === null),
    isAuthenticated: isAuthenticated && user !== null,
  };
}

And then you can use it to render the appropriate components:

src/App.tsx
TS
import { useCurrentUser } from "./useCurrentUser";

export default function App() {
  const { isLoading, isAuthenticated } = useCurrentUser();
  return (
    <main>
      {isLoading ? (
        <>Loading...</>
      ) : isAuthenticated ? (
        <Content />
      ) : (
        <LoginPage />
      )}
    </main>
  );
}

Debugging Authentication
You have followed one of our authentication guides but something is not working. You have double checked that you followed all the steps, and that you used the correct secrets, but you are still stuck.

Frequently encountered issues
ctx.auth.getUserIdentity() returns null in a query
This often happens when subscribing to queries via useQuery in React, without waiting for the client to be authenticated. Even if the user has been logged-in previously, it takes some time for the client to authenticate with the Convex backend. Therefore on page load, ctx.auth.getUserIdentity() called within a query returns null.

To handle this, you can either:

Use the Authenticated component from convex/react to wrap the component that includes the useQuery call (see the last two steps in the Clerk guide)
Or return null or some other "sentinel" value from the query and handle it on the client
If you are using fetchQuery for Next.js Server Rendering, make sure you are explicitly passing in a JWT token as documented here.

If this hasn't helped, follow the steps below to resolve your issue.

Step 1: Check whether authentication works on the backend
Add the following code to the beginning of your function (query, mutation, action or http action):
console.log("server identity", await ctx.auth.getUserIdentity());

Then call this function from whichever client you're using to talk to Convex.

Open the logs page on your dashboard.

What do you see on the logs page?

Answer: I don't see anything:

Potential cause: You don't have the right dashboard open. Confirm that the Deployment URL on Settings > URL and Deploy Key page matches how your client is configured.
Potential cause: Your client is not connected to Convex. Check your client logs (browser logs) for errors. Reload the page / restart the client.
Potential cause: The code has not been pushed. For dev deployments make sure you have npx convex dev running. For prod deployments make sure you successfully pushed via npx convex deploy. Go to the Functions page on the dashboard and check that the code shown there includes the console.log line you added.
When you resolved the cause you should see the log appear.

Answer: I see a log with 'server identity' null:

Potential cause: The client is not supplying an auth token.
Potential cause: Your deployment is misconfigured.
Potential cause: Your client is misconfigured.
Proceed to step 2.

Answer: I see a log with 'server identity' { tokenIdentifier: '... }

Great, you are all set!

Step 2: Check whether authentication works on the frontend
No matter which client you use, it must pass a JWT token to your backend for authentication to work.

The most bullet-proof way of ensuring your client is passing the token to the backend, is to inspect the traffic between them.

If you're using a client from the web browser, open the Network tab in your browser's developer tools.

Check the token

For Websocket-based clients (ConvexReactClient and ConvexClient), filter for the sync name and select WS as the type of traffic. Check the sync items. After the client is initialized (commonly after loading the page), it will send a message (check the Messages tab) with type: "Authenticate", and value will be the authentication token.

Network tab inspecting Websocket messages

For HTTP based clients (ConvexHTTPClient and the HTTP API), select Fetch/XHR as the type of traffic. You should see an individual network request for each function call, with an Authorization header with value Bearer followed by the authentication token.

Network tab inspecting HTTP headers

Do you see the authentication token in the traffic?

Answer: No:

Potential cause: The Convex client is not configured to get/fetch a JWT token. You're not using ConvexProviderWithClerk/ConvexProviderWithAuth0/ConvexProviderWithAuth with the ConvexReactClient or you forgot to call setAuth on ConvexHTTPClient or ConvexClient.

Potential cause: You are not signed in, so the token is null or undefined and the ConvexReactClient skipped authentication altogether. Verify that you are signed in via console.loging the token from whichever auth provider you are using:

Clerk:

// import { useAuth } from "@clerk/nextjs"; // for Next.js
import { useAuth } from "@clerk/clerk-react";

const { getToken } = useAuth();
console.log(getToken({ template: "convex" }));


Auth0:

import { useAuth0 } from "@auth0/auth0-react";

const { getAccessTokenSilently } = useAuth0();
const response = await getAccessTokenSilently({
  detailedResponse: true,
});
const token = response.id_token;
console.log(token);

Custom: However you implemented useAuthFromProviderX

If you don't see a long string that looks like a token, check the browser logs for errors from your auth provider. If there are none, check the Network tab to see whether requests to your provider are failing. Perhaps the auth provider is misconfigured. Double check the auth provider configuration (in the corresponding React provider or however your auth provider is configured for the client). Try clearing your cookies in the browser (in dev tools Application > Cookies > Clear all cookies button).

Answer: Yes, I see a long string that looks like a JWT:

Great, copy the whole token (there can be .s in it, so make sure you're not copying just a portion of it).

Open https://jwt.io/, scroll down and paste the token in the Encoded textarea on the left of the page. On the right you should see:

In HEADER, "typ": "JWT"
in PAYLOAD, a valid JSON with at least "aud", "iss" and "sub" fields. If you see gibberish in the payload you probably didn't copy the token correctly or it's not a valid JWT token.
If you see a valid JWT token, repeat step 1. If you still don't see correct identity, proceed to step 3.

Step 3: Check that backend configuration matches frontend configuration
You have a valid JWT token on the frontend, and you know that it is being passed to the backend, but the backend is not validating it.

Open the Settings > Authentication on your dashboard. What do you see?

Answer: I see This deployment has no configured authentication providers:

Cause: You do not have an auth.config.ts (or auth.config.js) file in your convex directory, or you haven't pushed your code. Follow the authentication guide to create a valid auth config file. For dev deployments make sure you have npx convex dev running. For prod deployments make sure you successfully pushed via npx convex deploy.
**Answer: I see one or more Domain and Application ID pairs.

Great, let's check they match the JWT token.

Look at the iss field in the JWT token payload at https://jwt.io/. Does it match a Domain on the Authentication page?

Answer: No, I don't see the iss URL on the Convex dashboard:

Potential cause: You copied the wrong value into your

auth.config.ts
's domain, or into the environment variable that is used there. Go back to the authentication guide and make sure you have the right URL from your auth provider.

Potential cause: Your client is misconfigured:

Clerk: You have the wrong publishableKey configured. The key must belong to the Clerk instance that you used to configure your

auth.config.ts.

Also make sure that the JWT token in Clerk is called convex, as that's the name ConvexProviderWithClerk uses to fetch the token!
Auth0: You have the wrong domain configured (on the client!). The domain must belong to the Auth0 instance that you used to configure your auth.config.ts.

Custom: Make sure that your client is correctly configured to match your auth.config.ts.

Answer: Yes, I do see the iss URL:

Great, let's move one.

Look at the aud field in the JWT token payload at https://jwt.io/. Does it match the Application ID under the correct Domain on the Authentication page?

Answer: No, I don't see the aud value in the Application ID field:

Potential cause: You copied the wrong value into your auth.config.ts 's applicationID, or into the environment variable that is used there. Go back to the authentication guide and make sure you have the right value from your auth provider.
Potential cause: Your client is misconfigured:
Clerk: You have the wrong publishableKey configured.The key must belong to the Clerk instance that you used to configure your auth.config.ts.
Auth0: You have the wrong clientId configured. Make sure you're using the right clientId for the Auth0 instance that you used to configure your auth.config.ts.
Custom: Make sure that your client is correctly configured to match your auth.config.ts.
Answer: Yes, I do see the aud value in the Application ID field:

Great, repeat step 1 and you should be all set!

ADVANCED
Custom OIDC Provider
Note: This is an advanced feature! We recommend sticking with the supported third-party authentication providers.

Convex can be integrated with any identity provider supporting the OpenID Connect protocol. At minimum this means that the provider can issue ID tokens and exposes the corresponding JWKS. The ID token is passed from the client to your Convex backend which ensures that the token is valid and enables you to query the user information embedded in the token, as described in Auth in Functions.

Server-side integration
Just like with Clerk and Auth0, the backend needs to be aware of the domain of the Issuer and your application's specific applicationID for a given identity provider.

Add these to your convex/auth.config.js file:

convex/auth.config.js
export default {
  providers: [
    {
      domain: "https://your.issuer.url.com",
      applicationID: "your-application-id",
    },
  ],
};

The applicationID property must exactly match the aud field of your JWT and the domain property must exactly match the iss field of the JWT. Use a tool like jwt.io to view an JWT and confirm these fields match exactly.

If multiple providers are provided, the first one fulfilling the above criteria will be used.

If you're not able to obtain tokens with an aud field, you'll need to instead configure a Custom JWT. If you're not sure if your token is an OIDC ID token, check the spec for a list of all required fields.

OIDC requires the routes ${domain}/.well-known/jwks.json and ${domain}/.well-known/openid-configuration. domain may include a path like https://your.issuer.url.com/api/auth. This isn't common for third party auth providers but may be useful if you're implementing OIDC on your own server.

Client-side integration
Integrating a new identity provider
The ConvexProviderWithAuth component provides a convenient abstraction for building an auth integration similar to the ones Convex provides for Clerk and Auth0.

In the following example we build an integration with an imaginary "ProviderX", whose React integration includes AuthProviderXReactProvider and useProviderXAuth hook.

First we replace ConvexProvider with AuthProviderXReactProvider wrapping ConvexProviderWithAuth at the root of our app:

src/index.js
import { AuthProviderXReactProvider } from "providerX";
import { ConvexProviderWithAuth } from "convex/react";

root.render(
  <StrictMode>
    <AuthProviderXReactProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromProviderX}>
        <App />
      </ConvexProviderWithAuth>
    </AuthProviderXReactProvider>
  </StrictMode>,
);


All we really need is to implement the useAuthFromProviderX hook which gets passed to the ConvexProviderWithAuth component.

This useAuthFromProviderX hook provides a translation between the auth provider API and the ConvexReactClient API, which is ultimately responsible for making sure that the ID token is passed down to your Convex backend.

src/ConvexProviderWithProviderX.js
function useAuthFromProviderX() {
  const { isLoading, isAuthenticated, getToken } = useProviderXAuth();
  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }) => {
      // Here you can do whatever transformation to get the ID Token
      // or null
      // Make sure to fetch a new token when `forceRefreshToken` is true
      return await getToken({ ignoreCache: forceRefreshToken });
    },
    // If `getToken` isn't correctly memoized
    // remove it from this dependency array
    [getToken],
  );
  return useMemo(
    () => ({
      // Whether the auth provider is in a loading state
      isLoading: isLoading,
      // Whether the auth provider has the user signed in
      isAuthenticated: isAuthenticated ?? false,
      // The async function to fetch the ID token
      fetchAccessToken,
    }),
    [isLoading, isAuthenticated, fetchAccessToken],
  );
}


Using the new provider
If you successfully follow the steps above you can now use the standard Convex utilities for checking the authentication state: the useConvexAuth() hook and the Authenticated, Unauthenticated and AuthLoading helper components.

Custom JWT Provider
Note: This is an advanced feature! We recommend sticking with the supported third-party authentication providers.

A JWT is a string combining three base64-encoded JSON objects containing claims about who a user is valid for a limited period of time like an hour. You can create them with a library like jose after receiving some evidence (typically a cookie) of a user's identity or get them from a third party authentication service like Clerk. The information in a JWT is signed (the Convex deployment can tell the information is really from the issuer and hasn't been modified) but generally not encrypted (you can read it by base64-decoding the token or pasting it into jwt.io.

If the JWTs issued to your users by an authentication service contain the right fields to implement the OpenID Connect (OIDC) protocol, the easiest way to configure accepting these JWTs is adding an OIDC Provider entry in convex/auth.config.ts. If the authentication service or library you're using to issue JWTs doesn't support these fields (for example OpenAuth JWTs missing an aud field because they implement the OAuth 2.0 spec but not OIDC) you'll need to configure a Custom JWT provider in the convex/auth.config.ts file.

Custom JWTs are required only to have header fields kid, alg and typ, and payload fields sub, iss, and exp. An iat field is also expected by Convex clients to implement token refreshing.

Server-side integration
Use type: "customJwt" to configure a Custom JWT auth provider:

convex/auth.config.js
export default {
  providers: [
    {
      type: "customJwt",
      applicationID: "your-application-id",
      issuer: "https://your.issuer.url.com",
      jwks: "https://your.issuer.url.com/.well-known/jwks.json",
      algorithm: "RS256",
    },
  ],
};

applicationID: Convex will verify that JWTs have this value in the aud claim. See below for important information regarding leaving this field out. The applicationID field is not required, but necessary to use with many authentication providers for security. Read more below before omitting it.
issuer: The issuer URL of the JWT.
jwks: The URL for fetching the JWKS (JSON Web Key Set) from the auth provider. If you'd like to avoid hitting an external service you may use a data URI, e.g. "data:text/plain;charset=utf-8;base64,ey..."
algorithm: The algorithm used to sign the JWT. Only RS256 and ES256 are currently supported. See RFC 7518 for more details.
The issuer property must exactly match the iss field of the JWT used and if specified the applicationID property must exactly match the aud field. If your JWT doesn't match, use a tool like jwt.io to view an JWT and confirm these fields match exactly.

Warning: omitting applicationID is often insecure
Leaving out applicationID from an auth configuration means the aud (audience) field of your users' JWTs will not be verified. In many cases this is insecure because a JWT intended for another service can be used to impersonate them in your service.

Say a user has accounts with https://todos.com and https://banking.com, two services which use the same third-party authentication service, accounts.google.com. A JWT accepted by todos.com could be reused to authenticate with banking.com by either todos.com or an attacker that obtained access to that JWT.

The aud (audience) field of the JWT prevents this: if the JWT was generated for a specific audience of https://todos.com then banking.com can enforce the aud field and know not to accept it.

If the JWTs issued to your users have an iss (issuer) URL like https://accounts.google.com that is not specific to your application, it is not secure to trust these tokens without an ApplicationID because that JWT could have been collected by a malicious application.

If the JWTs issued to your users have a more specific iss field like https://api.3rd-party-auth.com/client_0123... then it may be secure to use no aud field if you control all the services the issuer url grants then access to and intend for access to any one of these services to grants access to all of them.

Custom claims
In addition to top-level fields like subject, issuer, and tokenIdentifier, subfields of the nested fields of the JWT will be accessible in the auth data returned from const authInfo = await ctx.auth.getUserIdentity() like authInfo["properties.id"] and authInfo["properties.favoriteColor"] for a JWT structured like this:

{
  "properties": {
    "id": "123",
    "favoriteColor": "red"
  },
  "iss": "http://localhost:3000",
  "sub": "user:8fa2be73c2229e85",
  "exp": 1750968478
}

Client-side integration
Your users' browsers need a way to obtain an initial JWT and to request updated JWTs, ideally before the previous one expires.

See the instructions for Custom OIDC Providers for how to do this.