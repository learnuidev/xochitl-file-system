import { Fn, RemovalPolicy, Stack, StackProps, Tags } from "aws-cdk-lib";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { StageTypes } from "./constants/allowed-stages";

interface FileStorageStackProps extends StackProps {
  stage: StageTypes;
}

export class FileStorageStack extends Stack {
  readonly fileStorageBucketArn: string;
  constructor(scope: Construct, id: string, props: FileStorageStackProps) {
    super(scope, id, props);

    // file storage bucket
    const fileStorageBucket = new Bucket(this, "file-storage-stack", {
      bucketName: this.addStackSuffix("file-storage"),
      cors: [
        {
          allowedOrigins: ["*"],
          allowedMethods: [HttpMethods.GET, HttpMethods.PUT],
          allowedHeaders: ["*"],
        },
      ],
      // RemovalPolicy.DESTROY: Deletes s3 bucket and contents if stack is deleted
      removalPolicy:
        props.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    Tags.of(fileStorageBucket).add("Environment", props.stage);

    this.fileStorageBucketArn = fileStorageBucket.bucketArn;
  }

  private addStackSuffix(name: string) {
    return `${name}-${this.getStackSuffix()}`;
  }

  private getStackSuffix() {
    const shortStackId = Fn.select(2, Fn.split("/", this.stackId));
    return Fn.select(4, Fn.split("-", shortStackId));
  }
}
