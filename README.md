# jwt-server
A simple API to manage JSON Web Tokens.  

**NOTE:** This JWT API assumes your web application has an auto-timeout function for when a session goes too long without activity. Reauthorization tokens are not used. If a session times out, or when a user logs out, the app should then call the 'kill-token' route which will then invalidate the token.  I created this scheme because I find that reauth tokens present their own security issues.

## Installation
Run the following commands

     git clone https://github.com/seale61/jwt-server.git
     cd jwt-server
     npm install

Be sure to have mysql or mariadb installed, then create your database using the 'auth.sql' file.

     mysql -u <username> -p < auth.sql
     
Using the -p switch will prompt you for a password  

### Create a .env file  
In the same folder as the app.js file, create a file named **.env** and add the following lines (replacing the sample information with your own)

    DB_HOST=localhost
    DB_USER=your_mysql_username
    DB_PASS=your_mysql_password
    DATABASE=auth
    JWT_KEY=Some_long_string_of_characters_that_you_make_up


## SETUP
Running this script as a service will allow you to use it as a JWT server for any web sites/application across your network, allowing users route access anywhere they have proper credentials.  

The following example is for servers using **systemd** and **nginx**. Navigate to your '/etc/systemd/system' directory and create a file called **jwt-server.service** and enter the following code.

    [Unit]
    Description=Node.js JSON Webtoken API Server
    #Requires=After=mysql.service       # Requires the mysql service to run first  

    [Service]
    # Required on some systems
    WorkingDirectory=/apps/node-apis/jwt-server   # Use your own filepath, this is only an example
    ExecStart=/usr/bin/node app.js
    Restart=always
    # Restart service after 10 seconds if node service crashes
    RestartSec=10
    # Output to syslog
    StandardOutput=syslog
    StandardError=syslog
    SyslogIdentifier=jwt-server
    #User=<alternate user>
    #Group=<alternate group>
    Environment=NODE_ENV=production PORT=8069     # Whatever port you choose, but it must match the script

    [Install]
    WantedBy=multi-user.target

Once you have created this file, be sure to make it executable, then run the following commands:

    sudo systemctl enable jwt-server
    sudo systemctl start jwt-server
    
Running 'enable' will cause it to start when the server is rebooted.
