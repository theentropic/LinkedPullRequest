import * as vsts from "azure-devops-node-api";
import { IGitApi } from "azure-devops-node-api/GitApi";
import { GitPullRequestStatus, GitStatusState } from "azure-devops-node-api/interfaces/GitInterfaces";
import * as parser from "body-parser";
import express from "express";
import fs from "fs";

const app = express();

const data = fs.readFileSync("./config.json");
const config: { port: number, collection: string, token: string } = JSON.parse(data.toString());

const authHandler = vsts.getPersonalAccessTokenHandler(config.token);
const connection = new vsts.WebApi(config.collection, authHandler);

let vstsGit: IGitApi;
connection.getGitApi().then((success) => {
    vstsGit = success;
    console.log(success);
}, (error) => {
    console.log(error);
});

app.use(parser.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/", (req, res) => {
    // Get the details about the PR from the service hook payload
    const repoId = req.body.resource.repository.id;
    const pullRequestId = req.body.resource.pullRequestId;
    const title = req.body.resource.title;
    const descr = req.body.resource.description;

    // Build the status object that we want to post.
    // Assume that the PR is ready for review...
    const prStatus: GitPullRequestStatus = {
        context: {
            genre: "continuous-integration",
            name: "wip-checker",
        },
        description: "Ready for review",
        state: GitStatusState.Succeeded
    };

    // Check the title to see if there is "WIP" in the title.
    if (title.includes("WIP")) {
        // If so, change the status to pending and change the description.
        prStatus.state = GitStatusState.Pending;
        prStatus.description = "Work in progress";
    }

    // Post the status to the PR
    vstsGit.createPullRequestStatus(prStatus, repoId, pullRequestId).then((result) => {
        console.log(result);
    });

    res.send("Received the POST");
});

app.listen(config.port, () => {
    console.log(`server started at http://localhost:${config.port}`);
});
