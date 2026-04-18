import pexpect
import sys

child = pexpect.spawn('/bin/bash', ['-c', 'source ~/.zshrc && eas login'], encoding='utf-8')
child.expect('Email or username')
child.sendline('Viesa11')
child.expect('Password')
child.sendline('Viesa1111@')
child.expect(pexpect.EOF)
print(child.before)
