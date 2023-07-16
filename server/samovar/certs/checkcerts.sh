#!/bin/bash

# Путь к папке с сертификатами
CERTS_FOLDER="/apps/api/certs/"

# Доменное имя, для которого нужно проверить и обновить сертификаты
DOMAIN_NAME="api.zeleza.ru"  # Замените на ваше доменное имя

# Перезапуск Nginx и Gunicorn
RESTART_NGINX=0
RESTART_GUNICORN=0

# Функция для проверки срока действия сертификата
check_cert_expiration() {
    local cert_path="$1"
    local expiration_date=$(openssl x509 -enddate -noout -in "$cert_path" | cut -d "=" -f 2)
    local expiration_unix=$(date -d "$expiration_date" "+%s")
    local now_unix=$(date "+%s")
    local days_left=$(( (expiration_unix - now_unix) / (60*60*24) ))

    # Проверяем, если осталось менее 30 дней до истечения
    if [ "$days_left" -lt 30 ]; then
        echo "Сертификат '$cert_path' истекает через $days_left дней. Обновляем сертификат..."
        RESTART_NGINX=1
        RESTART_GUNICORN=1
        return 1
    fi

    return 0
}

# Проверяем наличие папки certs
if [ ! -d "$CERTS_FOLDER" ]; then
    echo "Папка для хранения сертификатов '$CERTS_FOLDER' не существует."
    exit 1
fi

# Проверяем файлы site.crt и site.key
if [ ! -f "$CERTS_FOLDER/$DOMAIN_NAME.crt" ] || [ ! -f "$CERTS_FOLDER/$DOMAIN_NAME.key" ]; then
    echo "Отсутствуют $DOMAIN_NAME.crt и/или $DOMAIN_NAME.key файлы. Обновляем сертификат..."
    RESTART_NGINX=1
    RESTART_GUNICORN=1
else
    check_cert_expiration "$CERTS_FOLDER/$DOMAIN_NAME.crt"
fi

# Обновляем сертификаты, если необходимо
if [ "$RESTART_NGINX" -eq 1 ] || [ "$RESTART_GUNICORN" -eq 1 ]; then
    certbot certonly --standalone -d "$DOMAIN_NAME"

    # Перезапускаем Nginx и Gunicorn при необходимости
    if [ "$RESTART_NGINX" -eq 1 ]; then
        echo "Перезапуск Nginx..."
        systemctl restart nginx
    fi

    if [ "$RESTART_GUNICORN" -eq 1 ]; then
        echo "Перезапуск Gunicorn..."
        systemctl restart gunicorn
    fi
else
    echo "Сертификаты в порядке. Ничего не обновлялось."
fi
