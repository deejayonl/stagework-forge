import sys

with open('server/src/index.ts', 'r') as f:
    content = f.read()

content = content.replace("client.send(message.toString());", "client.send(message, { binary: true });")

with open('server/src/index.ts', 'w') as f:
    f.write(content)

