# gatsby-source-greenhouse
> Loads job openings from greenhouse.io into Gatsby.js. Based on [gatsby-source-workable](https://github.com/tumblbug/gatsby-source-workable).

## Installation

```bash
npm install gatsby-source-greenhouse
```
or
```bash
yarn add gatsby-source-greenhouse
```

## Usage

To use this source you need to supply a Greenhouse API token. You can create a Greenhouse API token by logging into Greenhouse and going to `Configure > Dev Center > API Credential Management > Create New API Key`. Make sure it is type **Harvest**.

Next, edit `gatsby-config.js` to use the plugin:
```
{
    ...
    plugins: [
    ...
    {
      resolve: 'gatsby-source-greenhouse',
      options: {
        apiToken: '{API_TOKEN}',
      },
    },
  ]
}
```

By default, `gatsby-source-greenhouse` will only retrieve job openings that are marked as  *live*. To change this behavior, you can also supply an optional `queryParams` parameter inside of `options`. Possible values are detailed in [Greenhouse's API Documentation](https://developers.greenhouse.io/harvest.html?shell#job-posts).

## Querying

You can query the nodes created by the plugin as follows:
```graphql
{
    allGreenhouseJob {
        edges {
            node {
                ...
            }
        }
    }
}
```
