import createNodeHelpers from 'gatsby-node-helpers'

const {
  createNodeFactory,
  generateNodeId,
} = createNodeHelpers({
  typePrefix: `Greenhouse`,
})

const JOB_POST_TYPE = `JobPost`
const DEPARTMENT_TYPE = `Department`

export const JobPostNode = createNodeFactory(JOB_POST_TYPE, node => {
  node.slug = slugify(node.title)
  return node
})

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export const DepartmentNode = createNodeFactory(DEPARTMENT_TYPE, node => {
  node.slug = slugify(node.name)
  node.children = node.jobPosts.map(jobPost => {
    return generateNodeId(JOB_POST_TYPE, jobPost.id)
  })
  return node
})