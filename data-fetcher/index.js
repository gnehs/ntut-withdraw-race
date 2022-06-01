const axios = require('axios');
const fs = require('fs');
const path = require('path');
(async function () {
  const { data: main } = await axios.get('https://gnehs.github.io/ntut-course-crawler-node/main.json');
  let result = {};
  result[Object.keys(main)[0]] = {}
  for (let year of Object.keys(main)) {
    let courses = []
    result[year] = structuredClone(result[year - 1] ?? {})
    console.log(year, Math.max(...Object.values(result[year])))
    for (let sem of main[year]) {
      console.log('[fetch]', year, sem);
      const courseData = await axios.get(`https://gnehs.github.io/ntut-course-crawler-node/${year}/${sem}/main.json`);
      courses = courses.concat(courseData.data);
    }
    for (let course of courses) {
      for (let teacher of course.teacher) {
        let name = teacher.name
        if (!result[year][name]) {
          result[year][name] = 0
        }
        result[year][name] += parseInt(course.peopleWithdraw)
      }
    }
  }
  fs.writeFileSync(path.join(__dirname, '../result.json'), JSON.stringify(result));
})()