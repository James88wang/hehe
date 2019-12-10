![GitHub Logo](/images/logoece.jpg)
## ECE-NodeJS-Project Lab 3 
Lab 3 allows to:
  * add metrics
  * get one metric by key
  * get all metrics
  * delete one metric by key


#Prerequisites
---
Before you begin, ensure you have met the following requirement:
  * You have to install Node.js

Installing lab3
---
To install lab 3:
  * git clone https://github.com/James88wang/ECE-NodeJS-Project.git
  * go to "ECE-NodeJS-Project/lab3" directory 
  * npm install 
  
  
#Using lab3
---
go to lab3 terminal
npm run start

Post some metrics with Postman
* Set up a POST request on /metrics
* Set the header Content-Type:application/json
* Add an array of metrics as RAW body :
	* [{ "timestamp":"1384686660000", "value":"10" }]

localhost:8082/metrics/getAll <!---in order to retrieve all metrics --->
localhost:8082/metrics/getOne <!---in order to retrieve one metric by key --->
localhost:8082/metrics/delOne <!---in order to delete one metric by key --->


#Contributors
---
Wang James - Henintsoa Razafindrazaka


#Contact
---

* james.wang@edu.ece.fr
* henintsoa.razafindrazaka@edu.ece.fr
