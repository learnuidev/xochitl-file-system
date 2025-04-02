#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { FileStorageStack } from "../lib/file-storage-stack";
import { allowedStages, StageTypes } from "../lib/constants/allowed-stages";

const app = new cdk.App();

// Retrieve the stage from context or default to 'dev'
const stage: StageTypes = app.node.tryGetContext("stage") || allowedStages.dev;

// Validate the stage
if (!allowedStages?.[stage]) {
  throw new Error(
    `Invalid stage "${stage}". Allowed stages are: ${Object.values(allowedStages).join(", ")}`
  );
}

new FileStorageStack(app, "file-storage-stack", {
  stage,
});
