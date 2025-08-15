# **Legal Case Management Application**  


A full-stack application for managing legal cases with features for case filing.  
Supports role-based access for Clients and Lawyers, with secure authentication and CRUD operations.


**Features**  
------------
User Authentication & Authorization (JWT-based)  
Role Management (Client, Lawyer)  
Case Filing with unique case numbers  
Case Status Management (Filed → In Progress → Closed)  
Frontend built with React   
Backend with Node.js, Express, MongoDB  
PM2 + Nginx for production deployment  


**Tech Stack**  
--------------
Frontend: React, TailwindCSS, Axios  
Backend: Node.js, Express.js, MongoDB, Mongoose  
Auth: JWT Authentication  
Deployment: PM2, Nginx, Ubuntu Server, GitHub Actions CI/CD  


**Project structure**  
---------------------
Legal-Case-Manager/  
│── backend/             # Express backend  
│   ├── controllers/     # API controllers    
│   ├── models/          # Mongoose models    
│   ├── routes/          # API routes  
│   └── test/            # Mocha/Chai tests  
│── frontend/            # React frontend  
│   ├── src/             # React components & pages  
│   └── public/            
│── .github/workflows/   # GitHub Actions CI/CD  
│── README.md  


**Local Setup**  
---------------

1. Clone the Repository  
git clone https://github.com/yourusername/Legal-Case-Manager.git  
cd Legal-Case-Manager  

2. Setup Backend  
cd backend  
cp .env.example .env  # Add your own values  
npm install  

.env example:  
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db  
JWT_SECRET=your_secret  
PORT=5000  

3. Setup Frontend  
cd ../frontend  
npm install  
npm start  

4. Run  
npm run dev  


**Deploying to Ubuntu Server**
------------------------------

1. Setup nginx:  
ssh -i your-key.pem ubuntu@your-ip  
mkdir www  
cd www  
sudo apt-get install nginx  
sudo service nginx restart all  

2. Setup pm2:  
sudo apt-get update  
sudo apt install curl  
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash  
source ~/.bashrc  
nvm --version  
nvm install 22  
npm install -g pm2  

3. Setup Github actions:  
Settings->enivronment->new environment->add environment secret->  
(Add environment variables from .env file)  
Secrets and variables->Actions->New repository secret->  
(Add new secret PROD with all environment variables)  

4.Push to git on main branch:  
git add .  
git commit  
git push 

5. Create and start runner:  
create a new self-hosted runner (Linux x64) and run all the commands in Download and configure (expect run)  
sudo ./svc.sh install  
sudo ./svc.sh start  

6. Run pm2  

(in backend dir)  
npm install -g yarn  
yarn install  
nano .env (copy & paste .env file)  
cntrl+x y  
pm2 start “npm run start” --name=“backend”  

(in frontend dir)  
yarn install  
sudo rm -rf ./build  
yarn run build  
pm2 serve build/ 3000 --name "Frontend" --spa  

pm2 status  
pm2 save  

7. nginx configuration:  
sudo rm -r /etc/nginx/sites-available/default  
sudo nano /etc/nginx/sites-available/default ->  
   server {  
      server_name _;  
      location / {  
      proxy_pass http://localhost:3000;  
      proxy_set_header Host $host;  
      proxy_set_header X-Real-IP $remote_addr;  
      proxy_set_header X-Forwarded-for  
      $proxy_add_x_forwarded_for;  
   }  
sudo service nginx restart all  
pm2 restart all  
change base url in axiosConfig.js to public url of instance  

8. Access your application -> http://<your public ip addr>  



