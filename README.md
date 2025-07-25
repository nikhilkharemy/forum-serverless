

FOR EVERYONE





##1. Forum MILESTONE PLANNING##

**Start Date:** March 01, 2017

**1 Manage AWS Infrastructure**
- 1.1 Manage User Pools
- 1.2 DynamoDB Designing
- 1.3 Lambda Functions Plan
- 1.4 API Gateway Configuration
- 1.5 forum PoC
- 1.6 Technical Documentation 

**2 Manage Users**
- 2.1 Registration
- 2.2 Email Verification
- 2.3 Login
- 2.5 Roles and Groups 


**3 Manage forum**
- 3.1 Manage Topics
- 3.2 Manage Categories
- 3.3 Manage Posts
- 3.4 Manage Tags

**4 Manage Wall**
- 4.1 Notifications
- 4.2 Topic Search
- 4.3 Post Comments/Reply 
- 4.4 Subscribe/Follow Topic
- 4.5 Update Profiles
- 4.6 Report Offensive 

**5 Function Testing &amp; Security Integrations**
- 5.1 AWS Infrastructure Test
- 5.2 Lambda Test &amp; Optimisation
- 5.3 API Gateway Deployment Stages 

**End Date:** March 22, 2017 |


**4.1 DynamoDB**

Region: Asia Pacific (Mumbai)

Database: forum-db

Primary Key: id

**4.2 Amazon Cognito**

User Pool: forum-userpool

App Client: forum-appclient

App Client id: d7c5gf84c7qjopcn7j549ce4q

**4.3 Amazon S3**

Bucket Name: forum

**4.4 AWS Lambda**

Function Name: forum-\&lt;\&lt;HTTP METHOD\&gt;\&gt;-\&lt;\&lt;NAME\&gt;\&gt;

Role (existing): lambda\_basic\_execution

**4.5 API Gateway**

Name: forum-api

Resource Name: forum-resources

Enable API Gateway CORS: true

Authorizer: forum-authorizer

GET - Method Request Authorizer: forum-authorizer

Deploy API Stage:

Beta Environment

API URL: [http://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/beta](http://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/beta)

Staging Environment

API URL [https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/staging](https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/staging)

Production Environment

API URL: [https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/prod](https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/prod)





**0.1 15/01/2019 | Vinod Kumar Tiwari | Phase 1 for forum Technical and Architectural Overview**



local info

to run front end
ng serve --aot

to run back end
npm run dev
