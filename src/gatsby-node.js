const crypto = require('crypto')
const axios = require('axios')
import { JobPostNode, DepartmentNode } from './nodes'

/**
 * Return all open jobs for a given department
 * @param apiToken string.
 * @param departmentId string.
 */
async function getJobsForDepartment(apiToken, departmentId) {
  return axios.get('https://harvest.greenhouse.io/v1/jobs', {
    params: {
      department_id: departmentId,
      status: 'open'
    },
    auth: {
      username: apiToken,
      password: '',
    },
  })
}

/**
 * Return all job posts
 * @param apiToken string.
 * @param queryParams object, defaults to only live job posts
 */
async function getJobPosts(apiToken, queryParams) {
  return axios.get('https://harvest.greenhouse.io/v1/job_posts', {
    params: queryParams,
    auth: {
      username: apiToken,
      password: '',
    },
  })
}

/**
 * Gets all departments for a given organization
 * @param apiToken string.
 */
async function getDepartments(apiToken) {
  return axios.get('https://harvest.greenhouse.io/v1/departments', {
    auth: {
      username: apiToken,
      password: '',
    }
  })
}

/**
 * Gatsby requires ID to be a string to define nodes and greenhouse.io uses an integer instead.
 *
 * @param obj object.
 * @returns object.
 */
const changeId = obj => {
	const updatedObj = obj
	updatedObj.id = updatedObj.id.toString()
	return updatedObj
}

const defaultPluginOptions = {
  jobPosts: {
    live: true
  }
}

exports.sourceNodes = async ({ boundActionCreators }, { apiToken, pluginOptions }) => {
	const { createNode } = boundActionCreators
  const options = pluginOptions || defaultPluginOptions

  console.log(`Fetch Greenhouse data`)

  console.log(`Starting to fetch data from Greenhouse`)

  let departments, jobPosts
  try {
    departments = await getDepartments(apiToken).then(response => response.data)
    jobPosts = await getJobPosts(apiToken, options.jobPosts).then(response => response.data)
  } catch (e) {
    console.log(`Failed to fetch data from Greenhouse`)
    process.exit(1)
  }

  console.log(`jobPosts fetched`, jobPosts.length)
  console.log(`departments fetched`, departments.length)
  return Promise.all(
    departments.map(async department => {
      const convertedDepartment = changeId(department)
      
      let jobs
      try {
        const jobsForDepartmentResults = await getJobsForDepartment(apiToken, convertedDepartment.id)
        jobs = jobsForDepartmentResults.data.map(job => changeId(job))
      } catch (e) {
        console.log(`Failed to fetch jobs for department.`)
        process.exit(1)
      }

      var jobPostsMapping = jobPosts.reduce((map, jobPost) => { 
        if(map[jobPost.job_id]){
          map[jobPost.job_id].push(jobPost)
        } else {
          map[jobPost.job_id] = [jobPost]
        }

        return map
      }, {})


      var jobPostsForDepartment = jobs.reduce((arr, job) => {
        const mappedJobPost = jobPostsMapping[job.id]
        if (mappedJobPost) {
          arr.push(...mappedJobPost)
        }
        return arr
      }, [])

      convertedDepartment.jobPosts =  jobPostsForDepartment
      const departmentNode = DepartmentNode(changeId(convertedDepartment))

      jobPostsForDepartment.forEach(jobPost => {
        const convertedJobPost = changeId(jobPost)
        const jobPostNode = JobPostNode(convertedJobPost, { 
          parent: departmentNode.id 
        })
        createNode(jobPostNode)
      })
      
      createNode(departmentNode)
    })
  )
}
