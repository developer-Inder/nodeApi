const { database } = require('./db');

classwise = async (id=5)=>{

    boards = await database.query("SELECT * FROM tbl_boards", []);
    default_subject = await database.query("SELECT id FROM tbl_subjects LIMIT 1", []);
    subjects = await database.query("SELECT * FROM tbl_subjects", []);
    topic = await database.query("SELECT * FROM tbl_topic where class_id = ?", [id]);
    classes = await database.query('SELECT * FROM tbl_standards ORDER BY id ASC', []);
    entrance_exams = await database.query('select * from tbl_exams');
    govtexams = await database.query('select * from tbl_exams where exam_type_id = 5')
    enggstudymtrl = await database.query('select * from tbl_standards where 1')
    return  {
        boards: JSON.parse(boards),
        subjects: JSON.parse(subjects),
        sub: JSON.parse(default_subject),
        classes: JSON.parse(classes),
        topic: JSON.parse(topic),
        govtexams: JSON.parse(govtexams),
        current_subs: id
    }
}
fillData = async (obj)=>{
for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var result = await database.query('select * from ?? LIMIT 10',['tbl_'+key])
            obj[key] = JSON.parse(result)
        }
    }    
return obj
}
fillSingleData = async (key)=>{
   
                var result = await database.query('select * from ?? LIMIT 2',['tbl_'+key])
                return JSON.parse(result)
          
      
    }
getUserInterests  = async(req, user) => {
    
}

module.exports = {classwise, fillData, fillSingleData}