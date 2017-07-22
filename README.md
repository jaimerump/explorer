# explorer
An interface for service discovery files. In a service oriented architecture, services may not have static locations, and resources may move between services, so it's difficult or even impossible to know where anything is located. Instead, you have to ask the services which resources they support. Explorer parses discovery files and routes requests appropriately.

# Environment
* DISCOVERY_FILE - A reference to the maaster discovery file listing all of the other discovery files
* TOKEN_NAME - The name of the header token the services expect
* TOKEN_VALUE - The value of the header token the services expect

# Discovery Files
You must provide a master discovery file that looks like:
```
{
  "item-service": "https://s3.us-east-2.amazonaws.com/jaimerump-test/item/discover"
}
```
which points to individual service discovery files that look like:
```
```
{
  "resources": [
    {
      "name": "item",
      "methods": {
        "GET": {
          "uri": "/item/:id",
          "params": {
            "optional": [],
            "required": []
          }
        }
      },
      "resources": [
        {
          "name": "sub-resource",
          "uri": "/item/:id/sub-resource",
          "methods": {
            "GET": {
              "params": {
                "optional": [],
                "required": []
              }
            }
          }
        }
      ]
    }
  ]
}
```