# FAQ

## 1. How to translate a node?

1. Make sure your cognigy/CLI is configured correctly and pointing to your agent from the Cognigy.AI platform.
2. Check that you have the correct localisation set up in the Cognigy.AI platform.
3. Also check that the nodes in your flow are localised.
4. Pull the resource into your locale. Use the following command:

   ```cognigy pull flow <flow-name>```

5. Use the following command

   ```cognigy translate -l <locale-to-be-translated> -fl <original-language> -tl <to-be-translated-language> -tr microsoft -k <your-trasnlator-key> flow <flow-name>```

6. You can check that the resource got transalted correcly, navigating into your AgentDir.
7. If you wish you can push your changes back into Cognigy.AI with:

   ```cognigy push flow <flow-name>```

## 2. How to use execute command?

To see all the available option for the execute command you can use the following command:

   ```cognigy execute -l```

then you need to pass the arguments as a valid JSON string.
e.g. Let's read a flow
   ```cognigy execute readFlow -d {"flowId": "myFlowId"}```

**Working with extensions**

e.g. Let's list all the extensions in the Cognigy.AI platform:

   ```cognigy execute indexExtensions```

e.g. Let's list extensions by project identifier.

   ```cognigy execute indexExtensions -d '{"projectId": "myProjectId"}'```

e.g. Let's upload an extension.

   ```cognigy execute uploadExtension -d '{"projectId": "myProjectId", "url": "url-where-my-extension.tar.gz-is-placed" }'```

e.g. Let's delete an extension.

   ```cognigy execute deleteExtension -d '{ "extensionId": "myExtensionId" }'```

e.g. Let's update an extension.

   ```cognigy execute updateExtensionPackage -d '{"extension": "myExtensionId", "projectId": "myProjectId", "url": "url-where-my-extension.tar.gz-is-placed" }'```
