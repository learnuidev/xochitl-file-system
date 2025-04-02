import {
  Stack,
  StackProps,
  Aspects,
  Tag,
  RemovalPolicy,
  Fn,
} from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { StageTypes } from "./constants/allowed-stages";
import { Construct } from "constructs";

const addStackSuffix = (stack: Stack, name: string) => {
  const shortStackId = Fn.select(2, Fn.split("/", stack.stackId));
  const stackSuffix = Fn.select(4, Fn.split("-", shortStackId));
  return `${name}-${stackSuffix}`;
};

const createFileStorageBucket = (stack: Stack, stage: StageTypes) => {
  return new Bucket(stack, "file-storage-stack", {
    bucketName: addStackSuffix(stack, "file-storage"),
    cors: [
      {
        allowedOrigins: ["*"],
        allowedMethods: [HttpMethods.GET, HttpMethods.PUT],
        allowedHeaders: ["*"],
      },
    ],
    removalPolicy:
      stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
  });
};

const createFileMetadataTable = (stack: Stack, stage: StageTypes) => {
  return new Table(stack, "FileMetadataTable", {
    tableName: addStackSuffix(stack, "FileMetaDataTable"),
    partitionKey: { name: "userId", type: AttributeType.STRING },
    sortKey: { name: "fileId", type: AttributeType.STRING },
    billingMode: BillingMode.PAY_PER_REQUEST,
    stream: StreamViewType.NEW_AND_OLD_IMAGES,
    removalPolicy:
      stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    pointInTimeRecovery: stage === "prod",
  });
};

const applyEnvironmentTag = (stack: Stack, stage: StageTypes) => {
  Aspects.of(stack).add(new Tag("Environment", stage));
};

interface FileStorageStackProps extends StackProps {
  stage: StageTypes;
}

export const createFileStorageStack = (
  app: Construct,
  id: string,
  props: FileStorageStackProps
) => {
  const fileStorageStack = new Stack(app, id, props);

  const fileStorageBucket = createFileStorageBucket(
    fileStorageStack,
    props.stage
  );
  const fileMetadataTable = createFileMetadataTable(
    fileStorageStack,
    props.stage
  );

  applyEnvironmentTag(fileStorageStack, props.stage);

  return {
    fileStorageBucketArn: fileStorageBucket.bucketArn,
    fileMetadataTableArn: fileMetadataTable.tableArn,
  };
};
