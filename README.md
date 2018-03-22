# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1 + 2

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

### What do I do from here?
1. Download the server repository (https://github.com/udacity/mws-restaurant-stage-2/) and follow the setup for starting this on port `1337`. 
2. Edit `.tmp/localDiskDb.db` - add the key-value pair `photograph: "10",` to the last restaurant entry (bug filed: https://github.com/udacity/mws-restaurant-stage-2/issues/4)

3. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer. 

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 5500` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 5500`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

4. With your server running, visit the site: `http://localhost:5500`, and look around for a bit to see what the current experience looks like.
5. Explore the provided code, and make start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
6. Write code to implement the updates to get this site on its way to being a mobile-ready website.

### Images and Gulp
The images are provided with the repository, no explicit action needs to be taken - but if you want to try it out
run `npm install` followed by `gulp images`. 

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write. 



