# 1. Mongodb: replica set
```bash
git clone https://github.com/TuannHunggZ/Common-Stateful-Applications.git
cd Common-Stateful-Applications/Mongodb
docker compose up -d
```
Access the mongo1 container:
```bash
docker exec -it mongo1 mongosh
```
Check the replica set status:
```bash
rs.status()
```
Check connection via web [`http://localhost:3000`](http://localhost:3000)
# 2. Mysql: master and slave
```bash
git clone https://github.com/TuannHunggZ/Common-Stateful-Applications.git
cd Common-Stateful-Applications/Mysql
docker compose up -d
```
## Configure master
Access the mysql-master container:
```bash
docker exec -it mysql-master mysql -u root -p
```
Check the binary log status on mysql-master:
```bash
SHOW BINARY LOG STATUS\G
```
Take note of the following values:
- File: binary log file name (e.g., mysql-bin.000001)
- Position: binary log position (e.g., 157)
## Configure slave
Access the mysql-slave container:
```bash
docker exec -it mysql-slave mysql -u root -p
```
Read data from Slave only:
```bash
SET GLOBAL read_only = ON;
SET GLOBAL super_read_only = ON;
```
Run the following command, replacing the log file and position with the values from the master:
```bash
CHANGE REPLICATION SOURCE TO
SOURCE_HOST='mysql-master',
SOURCE_USER='repl',
SOURCE_PASSWORD='replpass',
SOURCE_LOG_FILE='mysql-bin.000001',
SOURCE_LOG_POS=157;
```
Start the replication process:
```bash
START REPLICA;
```
Verify the replication status:
```bash
SHOW REPLICA STATUS\G
```
## Check connection via web 
Access [`http://localhost:8080`](http://localhost:8080)
## 📌 Ghi chú
MySQL replication needs to be configured before running the web.

# 3. Redis: master and slave
Clone the repository and navigate to the Redis master-slave directory:
```bash
git clone https://github.com/TuannHunggZ/Common-Stateful-Applications.git
cd Common-Stateful-Applications/Redis/Master-Slave
docker compose up -d
```
## Verify Redis Master and Slave Working
- Access the Redis CLI inside a slave container:
```bash
docker exec -it redis-slave redis-cli
```
- Check replication status:
```bash
info replication
```
## Simulate Failover Using Sentinel
- Stop redis master
```bash
docker stop redis-master
```
- Connect to a Sentinel to confirm
```bash
docker exec -it sentinel1 redis-cli -p 26379
sentinel get-master-addr-by-name mymaster
```

# 4. Redis: cluster with shard
Clone the repository and navigate to the Redis cluster directory:
```bash
git clone https://github.com/TuannHunggZ/Common-Stateful-Applications.git
cd Common-Stateful-Applications/Redis/Cluster
docker compose up -d
```
Verify the Cluster
- Access the Redis CLI on any node:
```bash
docker exec -it redis-node1 redis-cli -c
```
- Then run:
```bash
cluster nodes
cluster info
```
Add a new node to a running Redis Cluster (Optional)
- Run the following command from redis-node1 or any container
```bash
docker exec -it redis-node1 redis-cli --cluster add-node 172.30.0.5:6379 172.30.0.2:6379
```
- Reshard data
```bash
docker exec -it redis-node1 redis-cli --cluster reshard 172.30.0.2:6379
```
