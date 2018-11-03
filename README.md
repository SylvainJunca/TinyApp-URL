# TinyApp Project

TinyApp is a fullstack web application buiolt woth Node and Express that allows users to shorten lon URLs

## Final Product

!["Screenshot of URLs page"](https://github.com/SylvainJunca/express-web-server/blob/master/docs/TinyURL-urls-page.png?raw=true)


##Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started 

- Install all dependancies (using the `npm install` command.
- Run the development web server using the `node express-server.js` command.
- Open your browser and go to `localhost:8080
- You'll need to register in order to use the app

## Features 

- You can shorten long URL and have access to all of them in your account
- You can share the short ULR.
- Each URL can be modified and deleted if needed, only by you.
- Each short URL stored shows you the number of times it has been used.
- Each short ULR page shows when you created them.
- The app stores only hashed version of user's password
- The app uses hashed cookies for more security and needs the user to login  again after 15 minutes
- This apps is ugly (not because of lack of time...) 
