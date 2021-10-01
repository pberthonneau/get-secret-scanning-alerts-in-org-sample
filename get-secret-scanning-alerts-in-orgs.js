#!/usr/bin/env node
// This app will return the list of secret scanning alert detail for a list of GitHub organizations
// Example: node get-secret-scanning-alerts-in-org-sample.js devops  > devops-alerts.csv

require('dotenv').config()
const pReduce = require('./lib/p-reduce');
const delay = require('delay');

const {Octokit} = require('@octokit/rest')
const {
  enterpriseCompatibility,
} = require("@octokit/plugin-enterprise-compatibility")
const MyOctokit = Octokit.plugin(enterpriseCompatibility);
const octokit = new MyOctokit({
  auth: process.env.GH_AUTH_TOKEN,
  previews: ['dorian-preview'],
  baseUrl: process.env.BASE_URL,
})

// Hash the secrets to allow to identify multiple usage of one secret without disclosing it
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

var buffer = ""
const [, , ...args] = process.argv

console.log("org,repo,secret_type,secret hash,state,resolution,created_at,resolved_at,resolved_by,html_url")

for (const org of args) {
  octokit
    .paginate(octokit.repos.listForOrg, {
        org: org,
      })
    .then(repositories =>
      pReduce(repositories, (repository) => {
        if (repository.archived) {
          return Promise.resolve();
        }
        const repo = repository.name

        return octokit
          .paginate("GET /repos/:owner/:repo/secret-scanning/alerts?per_page=100", {
            owner: org,
            repo: repo
          })
          .then(alerts => {
            if (alerts.length > 0) {
              pReduce(alerts, (alert) => {
                // const resolver = alert.resolved_by.login

                // resolver_account = JSON.stringify(resolver, null, 4); // (Optional) beautiful indented output.
                // console.error(resolver_account);

                console.log(`${org},${repo},${alert.secret_type},${alert.secret.hashCode()},${alert.state},`+
                      `${alert.resolution},${alert.created_at},${alert.resolved_at},${alert.resolved_by.login},${alert.html_url}`)
              }) 
            } 
            delay(300);
          })
          .catch(error => {
          // console.error(`Failed for ${org}/${repo}\n${error.message}\n${error.documentation_url}`)
          })        
      })
      
    )
    .catch(error => {
      console.error(`Getting repositories for organization ${org} failed.
      ${error.message} (${error.status})
      ${error.documentation_url}`)
    })
  }