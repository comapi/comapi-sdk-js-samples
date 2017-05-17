# AngularJS 4.x COMAPI CHAT DEMO

This is a minimal sample app using just the Comapi Foundation SDK. 

It is written in Angular 4.x


# Prerequisites
The following prerequisites are required to run this sample.

 - [node.js](https://nodejs.org/en/) - v4.x.x or higher
 - [npm](https://www.npmjs.com)  (Installed with Node.js) - v3.x.x or higher
 - [Angular CLI](https://www.npmjs.com/package/@angular/cli)  - To install this , run `npm install -g @angular/cli` in a terminal/console window.


 run `node -v` and `npm -v` in a terminal/console window. Older versions produce errors.


# Getting started

- Signup for Comapi account [here](http://www.comapi.com)
- Follow quickstart guide [here](http://docs.comapi.com/docs/quick-start) and create an api space
- Setup [authentication](http://docs.comapi.com/docs/channel-setup-app-messaging) for your apiSpace with the following values

| Name | Value |
| -----------| ----- |
| `Issuer`   |  `local`| 
| `Audience` |  `local`| 
| `Shared Secret` |  `secret`| 
| `ID Claim` |  `sub`| 

These same will be used in [auth.service.ts](./src/app/auth.service.ts) to create a JWT.


- Clone this repository ...

```
git clone https://github.com/comapi/comapi-sdk-js-samples.git
```
Change directory into the sample folder of this newly cloned repository
```
cd ./comapi-sdk-js-samples/foundation/AngularJS/4.x/basic_chat
```

- Enter your API Space Id in [app.settings.ts](src/app/app.settings.ts)
- Run `npm install` in this folder 
- Run `ng serve` in this folder 
- Browse to [here](http://localhost:4200) to see the app running


Comapi sdk is installed via a npm as part of `npm install`
This demo shows how to consume the Comapi JS sdk using ES6 style imports.


The project uses a Service to encapsulate Comapi sdk and provide messaging functionality to the app.

### Key Features:
 
 * Sdk initialisation and authentication are managed internally within this service - The app can just call the methods they require and the requested result will be returned via a promise.

 * Comapi events are internally subscribed to and re-published using rxjx Subjects to fit in with the angular framework and to mitigate against any race conditions with subscribing before sdk is initialised. 

## App Architecture
Here is a quick run through of the functionality that this app exposes. There are basically 3 pages as follows ...

### Login / Logout page
In order to create a Comapi session, you will need to create a profile within your apiSpace. This page allows you to specify a profileId that you would like to use. The authentication mechanism is dealt with entirely in the app to simplify this example.

When you launch this app you will end up on this page. Enter a profileId and you will be redirected to the conversation list view.  

### Conversations list view

This view displays a list of conversations and allows you to drill into a particular one. 
You can create a new conversation by clicking the settings dropdown at the top right and selecting `Create Conversation`


### Conversations detail view

This view displays a single conversation and allows you to send messages to it. 

You can add / remove paritcipants for this conversation and even delete it by selecting options from the settings drop down in the top right of the panel.

### Setup a conversation between 2 users

Here is a good way to test out the functionality of this test app with a multi user conversation:

- Open up 2 different browsers and navidate  to http://localhost:4200
    - Use different prowsers rather that multiple tabs as some session info is stored in local storage.

- Login to the app using different profileId's in each browser.

- Create a conversation in one of the browsers.

- in the same browser, add the other user as a participant.

- The conversation should appear in the other browser window.

- start sending mesages back and forth.





