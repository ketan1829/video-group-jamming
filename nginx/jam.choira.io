server {
        server_name jam.choira.io;
        # jam react ui
        location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        }
        #socket server
        location /socket.io {
                proxy_pass http://localhost:3001;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        }




    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/jam.choira.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/jam.choira.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
