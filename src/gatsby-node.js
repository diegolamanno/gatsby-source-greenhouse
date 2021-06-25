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
const changeId = (obj, property = "id") => {
	const updatedObj = obj
	updatedObj[property] = updatedObj[property].toString()
	return updatedObj
}

const defaultPluginOptions = {
  jobPosts: {
    live: true
  }
}

/**
 * Return all open jobs for a given department
 * @param jobs array of jobs or empty array.
 * @param jobPosts array of jobPosts.
 * @returns array of jobs with new jobPosts property.
 */
function mapJobPostsToJobs(jobs, jobPosts) {
  if (!jobs.length) {
    return jobs
  }

  const jobsMap = {}

  jobs.forEach((job) => (jobsMap[job.id] = { ...job, jobPosts: [] }))

  jobPosts.forEach((jobPost) => {
    if (jobsMap[jobPost.job_id] !== undefined) {
      jobsMap[jobPost.job_id].jobPosts.push(jobPost)
    }
  })

  return Object.values(jobsMap)
}

/**
 * Return all open jobs for a given department
 * @param jobs array of jobs or empty array.
 * @param jobPosts array of jobPosts or an empty array.
 * @returns array of all of the jobPosts found on the jobs.
 */
function flattenJobPosts(jobs, jobPosts) {
  if (!jobs.length) {
    return jobs
  }

  const jobIdsMap = {}
  jobs.forEach((job) => (jobIdsMap[job.id] = true))

  const flattenedJobPosts = jobPosts.map((jobPost) => {
    if (jobIdsMap[jobPost.job_id]) {
      return jobPost
    }
  })

  return flattenedJobPosts.filter((jobPost) => jobPost !== undefined)
}

exports.sourceNodes = async ({ actions }, { apiToken, pluginOptions }) => {
	const { createNode } = actions
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

  const convertedJobPosts = jobPosts.map((jobPost) => {
      const convertedJobPost = changeId(jobPost)
      return changeId(convertedJobPost, "job_id")
  })

  console.log(`jobPosts fetched`, jobPosts.length)
  console.log(`departments fetched`, departments.length)
  return Promise.all(
    departments.map(async department => {
      const convertedDepartment = changeId(department)
      
      let jobs
      try {
        const jobsForDepartmentResults = await getJobsForDepartment(apiToken, convertedDepartment.id)
        jobs = jobsForDepartmentResults.data.map(job => changeId(job))
        jobs = mapJobPostsToJobs(jobs, convertedJobPosts)
      } catch (e) {
        console.log(`Failed to fetch jobs for department.`)
        process.exit(1)
      }

      convertedDepartment.jobPosts =  flattenJobPosts(jobs, convertedJobPosts)
      const departmentNode = DepartmentNode(changeId(convertedDepartment))

      convertedDepartment.jobPosts.forEach(jobPost => {
        const jobPostNode = JobPostNode(jobPost, { 
          parent: departmentNode.id 
        })
        createNode(jobPostNode)
      })
      
      createNode(departmentNode)
    })
  )
}
