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

# 3. Redis: master and slave
Clone the repository and navigate to the Redis master-slave directory:
```bash
git clone https://github.com/TuannHunggZ/Common-Stateful-Applications.git
cd Common-Stateful-Applications/Redis/Master-Slave
docker compose up -d
```
Verify Redis Master and Slave Working
- Access the Redis CLI inside a slave container:
```bash
docker exec -it redis-slave redis-cli
```
- Check replication status:
```bash
info replication
```

# 4. Redis: cluster with shard
Clone the repository and navigate to the Redis cluster directory:
```bash
git clone https://github.com/TuannHunggZ/Common-Stateful-Applications.git
cd Common-Stateful-Applications/Redis/Cluster
docker compose up -d
```
Create the Redis Cluster (Shard Setup)
```bash
docker exec -it redis-node1 redis-cli --cluster create \
  172.30.0.2:6379 \
  172.30.0.3:6379 \
  172.30.0.4:6379 \
  --cluster-replicas 0
```
Verify the Cluster
- Access the Redis CLI on any node:
```bash
docker exec -it redis-node1 redis-cli
```
- Then run:
```bash
cluster nodes
cluster info
```