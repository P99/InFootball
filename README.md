# Welcome to InFootball

Introduction

### Index:
- [Installation](#Installation): Step-by-step instructions to get InFootball running on your computer

# High level view

Todo: Explain the main functionalities here

# Organization

- models: Describe the objects found in the database
- passport: Security handling & authentication
- public: All files from external sources
- views: A set of .jade templates and pieces of JavaScript
- server.js: Entry point of the application

# Dependencies

## Node.js packages:
- Express: Backbone of the web server
- Passport: Handle authentification (later with Twitter and Facebook)
- Jade: Allow to template pieces of HTML so they can be re-used across the site
- Socket.OI: Wrapper against websockets (handles namespaces and rooms)

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
