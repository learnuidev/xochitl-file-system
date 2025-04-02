#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { allowedStages, StageTypes } from "../lib/constants/allowed-stages";
import { createFileStorageStack } from "../lib/file-storage-stack";

const app = new cdk.App();

// Retrieve the stage from context or default to 'dev'
const stage: StageTypes = app.node.tryGetContext("stage") || allowedStages.dev;

// Validate the stage
if (!allowedStages?.[stage]) {
  throw new Error(
    `Invalid stage "${stage}". Allowed stages are: ${Object.values(allowedStages).join(", ")}`
  );
}

const fileStorageStack = createFileStorageStack(app, "file-storage-stack", {
  stage,
});
