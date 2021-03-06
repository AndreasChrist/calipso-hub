
- [Modules](#modules)
- [Howto Build](#howto-build)
- [Browse Calipso](#browse-calipso)
- [Browse the Database Console](#browse-the-database-console)
- [Use a custom database](#use-a-custom-database)
- [Create a RESTful service](#create-a-service)

## Modules
- calipso-hub (this one)
    - [calipso-hub-core]: application-specific components
    - [calipso-hub-framework]: development framework components
    - [calipso-hub-utilities]: utility components
    - [calipso-hub-webapp]: deployable web application (WAR)

## Howto Build [![Build Status](https://travis-ci.org/abissgr/calipso-hub.png?branch=master)](https://travis-ci.org/abissgr/calipso-hub)

To build Calipso you need a Java Development Kit and Apache Maven installed. 

0) To start, checkout the project:

    $ git clone git://github.com/abissgr/calipso-hub.git

1) Change to the project base directory:

    $ cd calipso-hub

2) Rename HOWTO.txt to dev.properties and (optionally) edit it: 

    $ mv HOWTO.txt dev.properties

3) Build the project 

    $ mvn clean install

4) Change to webapp module directory 

    $ cd calipso-hub-webapp

5) Start the Jetty server 

    $ mvn clean install jetty:run
    
## Browse Calipso

After you complete the steps above, you can access Calipso using your web browser: 

    http://localhost:8080/
    
## Browse the Database Console 

By default, Calipso uses H2, an in-memory database that works great for development.
A fresh copy is created with test data each time you start Jetty using mvn:run. 
The database console is available at: 

	http://localhost:8080/console/database/
	

## Use a custom database 

You can use a database like MySQL by commenting out the H2 database section in your dev.properties, 
then uncommenting the MySQL section. Other databases can be also be used.  
    

## Create a RESTful service

1) Create a domain/entity class, something like:

    https://github.com/abissgr/calipso-hub/blob/master/calipso-hub-framework/src/main/java/gr/abiss/calipso/model/Role.java

2) Create a repository class, something like:

    https://github.com/abissgr/calipso-hub/blob/master/calipso-hub-framework/src/main/java/gr/abiss/calipso/repository/RoleRepository.java
    
3) Create a service interface, something like:

    https://github.com/abissgr/calipso-hub/blob/master/calipso-hub-framework/src/main/java/gr/abiss/calipso/service/RoleService.java    
    
   
4) Create a service implementation, something like:

    https://github.com/abissgr/calipso-hub/blob/master/calipso-hub-framework/src/main/java/gr/abiss/calipso/service/impl/RoleServiceImpl.java

[calipso-hub-core]:calipso-hub-core
[calipso-hub-framework]:calipso-hub-framework
[calipso-hub-utilities]:calipso-hub-utilities
[calipso-hub-webapp]:calipso-hub-webapp
