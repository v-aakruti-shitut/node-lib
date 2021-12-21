# Snowflake
## This module wraps helper functions around snowflake to simplify development 

### Connection to snowflake
```const Snowflake = require('@kelchy/snowflake')
const Log = require('@kelchy/log')

// Initialise log
const log = new Log.Standard({})

// Connect to snowflake
// Success should log: {"scope":"connect db","msg":"Successfully connected to Snowflake","ts":"2021-12-21T10:30:55.183Z"}
const snowflake = new Snowflake({
    account: "<account>>",
    username: "<username>",
    password: '<password>',
    role: '<role>',
    database: '<database>',
    schema: '<schema>',
    warehouse: '<warehouse>'
  }, { log })

```

### SELECT query example
```
const testSelectQuery = async () => {
    let query = 'select * from example_table LIMIT 10'
    try {
        const data = await snowflake.query(query.trim())
        console.log(data)
    } catch(err) {
        throw err
    }
}
testSelectQuery()
```