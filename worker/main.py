import os
import json
import time
import logging
from datetime import datetime
from dotenv import load_dotenv
import redis
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/aitasks')
QUEUE_NAME = 'task_queue'

def get_redis():
    return redis.Redis(
        host=REDIS_HOST, port=REDIS_PORT,
        password=REDIS_PASSWORD, decode_responses=True,
        socket_connect_timeout=5, retry_on_timeout=True
    )

def get_db():
    client = MongoClient(MONGODB_URI)
    return client['aitasks']

def process_operation(operation: str, input_text: str) -> str:
    if operation == 'uppercase':
        return input_text.upper()
    elif operation == 'lowercase':
        return input_text.lower()
    elif operation == 'reverse':
        return input_text[::-1]
    elif operation == 'wordcount':
        count = len(input_text.split())
        return f"Word count: {count}"
    else:
        raise ValueError(f"Unknown operation: {operation}")

def add_log(db, task_id: str, message: str):
    db.tasks.update_one(
        {'_id': ObjectId(task_id)},
        {'$push': {'logs': {'message': message, 'timestamp': datetime.utcnow()}}}
    )

def process_task(db, task_data: dict):
    task_id = task_data['taskId']
    operation = task_data['operation']
    input_text = task_data['inputText']

    logger.info(f"Processing task {task_id} operation={operation}")

    db.tasks.update_one(
        {'_id': ObjectId(task_id)},
        {'$set': {'status': 'running'}}
    )
    add_log(db, task_id, f"Worker started processing. Operation: {operation}")

    try:
        time.sleep(1)
        result = process_operation(operation, input_text)
        db.tasks.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': {'status': 'success', 'result': result}}
        )
        add_log(db, task_id, f"Task completed successfully. Result: {result}")
        logger.info(f"Task {task_id} completed successfully")
    except Exception as e:
        db.tasks.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': {'status': 'failed', 'result': str(e)}}
        )
        add_log(db, task_id, f"Task failed: {str(e)}")
        logger.error(f"Task {task_id} failed: {e}")

def main():
    logger.info("Worker starting...")
    db = get_db()
    r = get_redis()
    logger.info("Worker ready. Listening for tasks...")

    while True:
        try:
            item = r.brpop(QUEUE_NAME, timeout=5)
            if item:
                _, value = item
                task_data = json.loads(value)
                process_task(db, task_data)
        except redis.ConnectionError as e:
            logger.error(f"Redis connection lost: {e}. Retrying in 5s...")
            time.sleep(5)
            r = get_redis()
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            time.sleep(1)

if __name__ == '__main__':
    main()