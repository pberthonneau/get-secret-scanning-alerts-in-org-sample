# Get secret scanning alerts in orgs

This repo demonstrates how to use the GitHub code scanning API to export all the alerts on an organization to a CSV file. This makes it possible for a security team to quickly audit the known vulnerabilities across their organizations that are using GitHub Advanced Security.

Limitation: there is no way to get the commit SHA and line number where the secret has been identified.

Notes:

- the secret is hashed to not disclose it but still be able to identify a secret committed in multiple places.
- this version is for GHES only

### Running the script

1. Clone this repo to your local machine
2. Create a file called .env
3. Create a [GitHub Token](https://github.com/settings/tokens) which has the `repo` > `security_events` permission. (`repo` permission is needed for private repo)
4. Add the token to your .env file as shown `GH_AUTH_TOKEN=inserttokenhere`
5. For GHES, add a BASE_URL to .env like BASE_URL=https://mygithubserver.com/api/v3 and uncomment [line 10 in get-secret-scanning-alerts-in-org-sample.js](get-secret-scanning-alerts-in-org.js#L10)
6. Run `npm install` to install node dependencies
7. Run `node get-secret-scanning-alerts.js orgnames > output.csv` where `orgnames` is a list of target org names. Note, if SSO is enabled on your org, you will need to SSO enable your token

### Next step

Create a workflow that upload the result as an Artifact. In a private repo of course.

### License

This project is licensed under the MIT License.
