#!/bin/bash

FILE_CONFIG=./config.ini

create_json_history() {
input_file=${1}
# Initialize the JSON string
json_string="{"
json_end=""
# Read the input file line by line
while IFS= read -r line; do
    echo "${line}" | grep -q '^$' && continue
    # Check if the line starts with "###"
    if [[ $line == "### "* ]]; then
        # Extract the version number
        version=$(echo $line | cut -d' ' -f2-)
        # Add the version to the JSON string
        [ "${json_string: -1}" == "," ] && json_string="${json_string%?}"
        json_string="$json_string$json_end"
        json_string="$json_string\"$version\":"
    elif [[ $line == "#### "* ]]; then
        # Extract the date
        date=$(echo $line | cut -d' ' -f2-)
        # Add the date to the JSON string
        json_string="$json_string{\"date\": \"$date\", \"items\":["
    elif [[ $line == "-"* ]]; then
        # Extract the history item
        history_item=$(echo $line | sed 's/^- // ')
        # Convert markdown links to HTML links
        history_item=$(echo $history_item | sed -r 's/\[([^\[]+)\]\(([^\)]+)\)/<a href=\\"\2\\">\1<\/a>/g' | sed "s/'//g; s/\"/\"/g; s/\[/(/g;  s/\]/)/g")
        # Add the history item to the JSON string
        json_string="$json_string\"$history_item\","
    fi

    json_end="]},"
done < "$input_file"

# Remove the trailing comma from the last history item
json_string="${json_string%?}"
json_string="{$(echo "${json_string}" | cut -d'{' -f2-)"
set -x
# Close the items array, version object, and versions object
json_string="$json_string]}}"
set +x
echo "${json_string}"

}

#create_json_history './rodina/HISTORY.md'
#exit
# Функция для создания JSON-массива из конфигурационной секции
create_json_array() {
  local app_name="$1"
  local rus_name="$2"
  local simple_desc="$3"
  local full_desc="$4"
  local history="$5"
  # Считываем данные из файла HISTORY.md и формируем их в виде строки JSON
  local history_data=$(create_json_history "./${history}" )
#  history_data="${history_data}"

  # Создаем JSON-массив для текущей секции
  local json_array=$(jq -n \
    --arg app_name "$app_name" \
    --arg rus_name "$rus_name" \
    --arg simple_desc "$simple_desc" \
    --arg full_desc "$full_desc" \
    --argjson history_data "$history_data" \
    '{app_name: $app_name, rus_name: $rus_name, simple_desc: $simple_desc, full_desc: $full_desc, history: $history_data}'
  )

  echo "$json_array"
}

# Инициализация массива для накопления данных
json_array_collection=""

# Чтение и обработка файла конфигурации
while IFS= read -r line; do
  if [[ $line == \[* ]]; then
    if [[ -n $app_name ]]; then
      json_array=$(create_json_array "$app_name" "$rus_name" "$simple_desc" "$full_desc" "$history_file")
      json_array_collection="${json_array_collection}${json_array},"
    fi
    app_name=$(echo "$line" | tr -d '[]')
    rus_name=
    simple_desc=
    full_desc=
  elif [[ $line == *=* ]]; then
    key=$(echo "$line" | cut -d'=' -f1 | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
    value=$(echo "$line" | cut -d'=' -f2- | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

    case $key in
      "rus_name")
        rus_name="$value"
        ;;
      "simple_desc")
        simple_desc="$value"
        ;;
      "full_desc")
        full_desc="$value"
        ;;
      "history")
        history_file="$value"
        ;;
    esac
  fi
done < "${FILE_CONFIG}"

# Обработка последней секции
if [[ -n $app_name ]]; then
  json_array=$(create_json_array "$app_name" "$rus_name" "$simple_desc" "$full_desc" "$history_file")
  json_array_collection="${json_array_collection}${json_array}"
fi

echo "$json_array_collection"
# Отправка JSON-массива через POST-запрос
#curl -X POST -H "Content-Type: application/json" -d "[$json_array_collection]" http://api.server/v1/init_bd
