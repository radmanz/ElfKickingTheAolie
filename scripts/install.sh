#!/bin/bash
sudo apt install chromium-browser unclutter
sudo cp ektabesugui.service /etc/systemd/system/ektabesugui.service
sudo systemctl enable ektabesugui.service
sudo systemctl start ektabesugui.service