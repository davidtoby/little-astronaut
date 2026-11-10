#!/bin/zsh
TASK_ROOT=${0:A:h}
python3 "$TASK_ROOT/manage.py" stop
