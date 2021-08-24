# AWS

## This module wraps helper functions around aws-sdk to simplify development 

- Requires
```
aws-sdk
```

- Environment variables required or credential files present
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

- Basic Initialization - s3
```
const Aws = require('@kelchy/aws')
const s3 = new Aws.S3()
```
- Custom client options - override region and apiVersion
```
const s3 = new Aws.S3({ region: 'ap-southeast-1', apiVersion: '2006-03-01' })
```

- supported methods
```
getS3Object(bucket, key) - fetch the object denoted by key from specific bucket, returns a buffer (use .toString('utf8'))
```
