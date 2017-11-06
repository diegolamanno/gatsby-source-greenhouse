const crypto = require('crypto')
const axios = require('axios')

/**
 * Greenhouse promise request.
 * @param apiToken string.
 */
const getJobs = apiToken =>
	axios.get('https://harvest.greenhouse.io/v1/job_posts', {
		params: {
			live: true,
		},
		auth: {
			username: apiToken,
			password: '',
		},
	})

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

exports.sourceNodes = async ({ boundActionCreators }, { apiToken }) => {
	const { createNode } = boundActionCreators

	const result = await getJobs(apiToken)
	const jobs = result.data

	jobs.forEach(job => {
		const jsonString = JSON.stringify(job)
		const gatsbyNode = {
			...changeId(job),
			children: [],
			parent: '__SOURCE__',
			internal: {
				type: 'GreenhouseJob',
				content: jsonString,
				contentDigest: crypto
					.createHash('md5')
					.update(jsonString)
					.digest('hex'),
			},
		}
		createNode(gatsbyNode)
	})
}
