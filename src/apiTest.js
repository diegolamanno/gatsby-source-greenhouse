const axios = require('axios')

const changeId = obj => {
	const updatedObj = obj
	updatedObj.id = updatedObj.id.toString()
	return updatedObj
}

axios
	.get('https://harvest.greenhouse.io/v1/job_posts', {
		params: {
			live: true,
		},
		auth: {
			username: '05442bf5b72f2c37e42123701d9bf788-1',
			password: '',
		},
	})
	.then(function(response) {
		const jobs = response.data
		jobs.forEach(job => {
			console.log('==================\n')
			const cleanJob = changeId(job)
			console.log(cleanJob.title)
		})
	})
	.catch(function(error) {
		console.log(error)
	})
