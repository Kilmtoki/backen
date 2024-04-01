from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from pytz import timezone
from bson import ObjectId

app = Flask(__name__)
CORS(app)
dataques = {
    "question": {
        "1": {
            "audio": None
        },
        "2": {
            "audio": None
        },
        "3": {
            "audio": None
        },
        "4": {
            "audio": None
        },
        "5": {
            "audio": None
        },
        "6": {
            "audio": None
        },
        "7": {
            "audio": None
        },
        "8": {
            "audio": None
        },
    },
    "datetime": ""
}

client = MongoClient("mongodb://localhost:27017/")
db = client["mydb"]
@app.route('/')
def hello_world():
    return 'Hello, World!'

###################################################Admin###############################################################
@app.route('/newadmin', methods=['POST'])
def newadmin():
    try:
        admin_data = request.json
        id_admin = admin_data["id_admin"]
        password = admin_data["password"]
        
        # ตรวจสอบว่ามี id_admin และ password ในข้อมูลที่ส่งมาหรือไม่
        if not id_admin or not password:
            return jsonify({"status": "error", "message": "Missing admin ID or password"}), 400
        
        # ตรวจสอบว่ามีผู้ดูแลระบบนี้อยู่ในระบบแล้วหรือไม่
        existing_admin = db.admin.find_one({"id_admin": id_admin})
        if existing_admin:
            return jsonify({"status": "error", "message": "Admin already exists"}), 409
        
        # สร้างผู้ดูแลระบบใหม่และบันทึกข้อมูลลงในฐานข้อมูล
        new_admin = {"id_admin": id_admin, "password": password}
        db.admin.insert_one(new_admin)
        return jsonify({"status": "ok", "message": "New admin created successfully"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": "Internal Server Error", "error": str(e)}), 500

@app.route('/adminlogin', methods=['POST'])
def login_admin():
    # รับข้อมูลจากคำขอ
    login_data = request.json
    id_admin = login_data.get('id_admin')
    password = login_data.get('password')

    # ค้นหาข้อมูล admin จากฐานข้อมูล
    admin = db.admin.find_one({'id_admin': id_admin, 'password': password})

    # ตรวจสอบว่า admin พบหรือไม่
    if admin:
        # สร้าง token หรือ session สำหรับ admin
        # ในที่นี้เราจะใช้งานง่ายๆ โดยสร้าง token จาก id_admin
        token = id_admin
        return jsonify({'status': 'success', 'token': token}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Invalid admin ID or password'}), 401

###################################################Users###############################################################
@app.route('/users/get', methods=['GET'])
def get_users():
    try:
        users = list(db.users.find({}))
        for user in users:
            user['_id'] = str(user['_id'])
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "Internal Server Error", "error": str(e)}), 500
    
@app.route('/newuser', methods=['POST'])
def create_user():
    try:
        # รับข้อมูล PID และ Name จากคำขอ
        user_data = request.json
        PID = user_data.get('PID')
        name = user_data.get('name')
        
        # ตรวจสอบว่า PID ซ้ำกันหรือไม่
        existing_user = db.users.find_one({'PID': PID})
        if existing_user:
            return jsonify({'status': 'error', 'message': 'PID already exists'}), 400

        # สร้าง KID จากรหัส 4 ตัวท้ายของ PID
        KID = PID[-4:]

        # สร้างข้อมูลผู้ใช้ใหม่
        new_user = {
            'KID': KID,
            'PID': PID,
            'name': name,
            'date': '-',
            'time': '-',
            'SBP': '-',
            'DBP': '-'
        }

        # เพิ่มข้อมูลผู้ใช้ใหม่ลงในฐานข้อมูล
        db.users.insert_one(new_user)

        return jsonify({'status': 'ok', 'message': 'User created successfully'}), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/users/delete', methods=['DELETE'])
def delete_user():
    try:
        KID = request.json["KID"]
        db.users.delete_one({"KID": KID})
        return jsonify({"status": "ok", "message": f"User with KID {KID} is deleted"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "Internal Server Error", "error": str(e)}), 500


@app.route('/user/login', methods=['POST'])
def login():
    try:
        # รับข้อมูลที่ส่งมาจากคำขอ
        login_data = request.json
        KID = login_data.get('KID')
        SBP = login_data.get('SBP')
        DBP = login_data.get('DBP')

        # หาข้อมูลผู้ใช้จาก KID
        user = db.users.find_one({'KID': KID})

        if user:
            # อัพเดตค่า SBP และ DBP ของผู้ใช้
            db.users.update_one({'KID': KID}, {'$set': {'SBP': SBP, 'DBP': DBP}})

            # สร้างวันที่และเวลาประเทศไทย
            thailand_timezone = timezone('Asia/Bangkok')
            thai_time = datetime.now(thailand_timezone)
            thai_date = thai_time.strftime('%d/%m/%Y')
            thai_time_str = thai_time.strftime('%H:%M:%S')

            # อัพเดตค่า date และ time ของผู้ใช้
            db.users.update_one({'KID': KID}, {'$set': {'date': thai_date, 'time': thai_time_str}})
            token = KID
            return jsonify({'status': 'success', 'token': token}), 200
        else:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

###################################################Questions###############################################################
@app.route('/question/get', methods=['GET'])
def get_questions():
    try:
        questions = list(db.question.find({}))
        for question in questions:
            question['_id'] = str(question['_id'])
            print(str(question['_id']))
        return jsonify(questions), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "Internal Server Error", "error": str(e)}), 500

@app.route('/question/post', methods=['POST'])
def post_question():
    try:
        question_data = request.json
        questions_no = question_data["QuestionsNo"]
        print(question_data)
        message = question_data["Message"]
        existing_question = db.question.find_one({"QuestionsNo": questions_no})
        if existing_question:
            db.question.update_one({"QuestionsNo": questions_no}, {"$set": {"Message": message}})
            return jsonify({"status": "ok", "message": f"Question with QuestionsNo {question_data['QuestionsNo']} is updated"}), 200
        else:
            question_data["_id"] = ObjectId()
            db.question.insert_one(question_data)
            return jsonify({"status": "ok", "message": f"Question with QuestionsNo {question_data['QuestionsNo']} is posted"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "Internal Server Error", "error": str(e)}), 500
  
@app.route('/question/delete', methods=['DELETE'])
def delete_question():
    try:
        QuestionsNo = request.json["QuestionsNo"]
        deleted_question = db.question.find_one({"QuestionsNo": QuestionsNo})
        if not deleted_question:
            return jsonify({"status": "error", "message": f"Question No {QuestionsNo} not found"}), 404
        db.question.delete_one({"QuestionsNo": QuestionsNo})
        return jsonify({"status": "ok", "message": f"Question No {QuestionsNo} is deleted"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "Internal Server Error", "error": str(e)}), 500
    
@app.route('/question/getaudio', methods=['GET'])
def get_questions2():
    try:
        QuestionsNo = request.args.get("QuestionsNo")  # Access QuestionsNo from query string
        print(QuestionsNo)
        question = db.question.find_one({"QuestionsNo": QuestionsNo})  # Search for the question using QuestionsNo
        if question:
            message = question.get("Message", None)  # Find the message associated with the question
            if message:
                return jsonify({"status": "ok", "message": message}), 200  # Return the message if found
            else:
                return jsonify({"status": "error", "message": "Message not found for QuestionsNo"}), 500
        else:
            return jsonify({"status": "error", "message": f"Question No {QuestionsNo} not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": "Internal Server Error", "error": str(e)}), 500







###################################################Answer###############################################################
@app.route('/answers/<KID>', methods=['GET'])
def get_answers(KID):
    try:
        # ค้นหาข้อมูลคำตอบของผู้ใช้ที่มี KID เท่ากับค่าที่ระบุ
        user_answers = list(db.answer.find({'KID': KID}))

        if user_answers:
            # สร้างลิสต์เก็บข้อมูลคำตอบทั้งหมด
            all_answers = []

            # วนลูปเพื่อดึงข้อมูล AnswerNo และ Message ของแต่ละคำตอบ
            for answer in user_answers:
                answer_info = {
                    'AnswerNo': answer.get('AnswerNo', ''),
                    'Message': answer.get('Message', '')
                }
                all_answers.append(answer_info)

            return jsonify({'status': 'success', 'answers': all_answers}), 200
        else:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001)
