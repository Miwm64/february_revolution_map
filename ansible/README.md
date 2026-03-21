### Deploy
Backend
```commandline
ansible-playbook deploy.yml --tags frmap_backend -l miwm64.spb.ru -i inventory.ini --vault-password-file ./vault.pass
```

Frontend
```commandline
ansible-playbook deploy.yml --tags frmap_frontend -l miwm64.spb.ru -i inventory.ini
```

Encrypt vault
```commandline
ansible-vault encrypt_string --vault-password-file ./vault.pass '<string_to_encrypt>' --name '<string_name_of_variable>' 
```

Decrypt vault
```commandline
ansible localhost -m ansible.builtin.debug -a var="secret_name" -e "@group_vars/all/vault.yml" --vault-password-file ./vault.pass 
```

Add to known hosts
```commandline
ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
```