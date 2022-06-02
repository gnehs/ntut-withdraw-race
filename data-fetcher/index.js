const axios = require('axios');
const fs = require('fs');
const path = require('path');
async function downloadAllData() {
  const { data: main } = await axios.get('https://gnehs.github.io/ntut-course-crawler-node/main.json')
  let parsedMain = Object.entries(main).map(([key, value]) => [...value.map(x => `${key}/${x}`)]).flat()
  let res = { main: parsedMain }
  let done = 0
  let tasks = parsedMain.map(async x => {
    const { data } = await axios.get(`https://gnehs.github.io/ntut-course-crawler-node/${x}/main.json`)
    res[x] = data
    done++
    console.log(`(${done}/${parsedMain.length})`, x)
  })
  await Promise.all(tasks)
  return res
}


(async function () {
  const data = await downloadAllData()

  // withdraw_teacher
  let teachers = {}
  let result = {};
  for (let yearsem of data.main) {
    const courseData = data[yearsem];
    for (let course of courseData) {
      for (let teacher of course.teacher) {
        let name = teacher.name
        if (!teachers[name]) {
          teachers[name] = 0
        }
        teachers[name] += parseInt(course.peopleWithdraw)
      }
    }
    let [year, sem] = yearsem.split('/')
    // write data
    result[`${parseInt(year) + 1911}-${sem == 1 ? '02' : '09'}-01`] = structuredClone(teachers)
  }

  // convert to csv
  let csv = 'date,name,peopleWithdraw\n'
  for (let date of Object.keys(result)) {
    let data = result[date]
    for (let teacher of Object.keys(data)) {
      csv += `${date},${teacher},${data[teacher]}\n`
    }
  }
  fs.writeFileSync(path.join(__dirname, '../datasets/withdraw_teacher.csv'), csv)

  // withdraw_course
  let courses = {}
  result = {}
  for (let yearsem of data.main) {
    const courseData = data[yearsem];
    for (let course of courseData) {
      // remove () （）
      let name = course.name.zh.replace(/\(.*\)|（.*）/g, '')
      if (!courses[name]) {
        courses[name] = 0
      }
      courses[name] += parseInt(course.peopleWithdraw)
    }
    let [year, sem] = yearsem.split('/')
    // write data
    result[`${parseInt(year) + 1911}-${sem == 1 ? '02' : '09'}-01`] = structuredClone(courses)
  }
  csv = 'date,name,peopleWithdraw\n'
  for (let date of Object.keys(result)) {
    let data = result[date]
    for (let course of Object.keys(data)) {
      csv += `${date},${course},${data[course]}\n`
    }
  }
  fs.writeFileSync(path.join(__dirname, '../datasets/withdraw_course.csv'), csv)

  // withdraw_general
  courses = {}
  result = {}
  for (let yearsem of data.main) {
    const courseData = data[yearsem].filter(x =>
      x.class
        .map(y => y.name)
        .join('')
        .match(/^博雅/)
    )
    for (let course of courseData) {
      // remove () （）
      let name = course.name.zh.replace(/\(.*\)|（.*）/g, '')
      if (!courses[name]) {
        courses[name] = 0
      }
      courses[name] += parseInt(course.peopleWithdraw)
    }
    let [year, sem] = yearsem.split('/')
    // write data
    result[`${parseInt(year) + 1911}-${sem == 1 ? '02' : '09'}-01`] = structuredClone(courses)
  }
  csv = 'date,name,peopleWithdraw\n'
  for (let date of Object.keys(result)) {
    let data = result[date]
    for (let course of Object.keys(data)) {
      csv += `${date},${course},${data[course]}\n`
    }
  }
  fs.writeFileSync(path.join(__dirname, '../datasets/withdraw_general.csv'), csv)

})()