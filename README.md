# Welcome to InFootball

InFootball is an infrastructure to enhance user experience while watching a football match
Players receive questions related to the ongoing actions
They have a choice with a limited set of answers
Players can compete with friends with a special scoring system

[QuickStart](/w/gettingstarted/#installation): Step-by-step instructions to get InFootball running on your computer

# High level view

InFootball implements different views for 3 different kind of users
- Players: Can join ongoing matches, they receive questions and try to answer them as fast as possible
- Operators: They are editing and selecting questions
- Admin: They can create and promote users

The project uses node.js server, it means everything is made in JavaScript
InFootball is hosted on OpenShift: [InFootball](https://infootball-p99.rhcloud.com/home)

# Organization

Main files an folders in Infootball source

- models: Describe the objects found in the database
- passport: Security handling & authentication
- public: All files from external sources
- views: A set of .jade templates and pieces of JavaScript
- server.js: Entry point of the application

# Dependencies

## Node.js packages

- Express: Backbone of the web server
- Passport: Handle authentification (later with Twitter and Facebook)
- Jade: Allow to template pieces of HTML so they can be re-used across the site
- Socket.OI: Wrapper against websockets (handles namespaces and rooms)
- Mongoose: Is a wrapper around MongoDB (provide validation, hooks etc)

## JQuery modules

- [JTable](http://www.jtable.org): Can display fancy tables with sorted data extracted from the database

# Installation

1. Install [Node.js](https://nodejs.org) and Git

2. Register your public key

Generate [SSH keys](https://help.github.com/articles/generating-ssh-keys/) and send the public key to p99_pascal@yahoo.fr
Then wait ;-)

3. Clone the repository

```
$ git clone ssh://554fae7e5973ca615500001c@infootball-p99.rhcloud.com/~/git/infootball.git/
```
A new directory called 'infootball' has been created

4. Install InFootball dependancies

```
$ cd infootbal
$ npm install
```

5. Run Node.js web server
```
$ node server.js
```

6. Load 'localhost:8080' in your favorite browser
