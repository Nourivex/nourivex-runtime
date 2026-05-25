import os
import shutil
import datetime

class ConfigManager:
    def __init__(self, env_path=".env"):
        self.env_path = env_path

    def get_key(self, key: str) -> str:
        if not os.path.exists(self.env_path):
            return None
        
        try:
            with open(self.env_path, "r") as f:
                for line in f:
                    if line.startswith(f"{key}="):
                        return line.strip().split("=", 1)[1]
        except (FileNotFoundError, IndexError):
            return None
        return None

    def set_key(self, key: str, value: str) -> bool:
        lines = []
        found = False
        current_value = self.get_key(key)
        
        # Idempotency check: if current value is same as new value, do nothing
        if current_value == value:
            return False

        if os.path.exists(self.env_path):
            with open(self.env_path, "r") as f:
                lines = f.readlines()

        new_lines = []
        for line in lines:
            if line.startswith(f"{key}="):
                new_lines.append(f"{key}={value}\n")
                found = True
            else:
                new_lines.append(line)
        
        if not found:
            new_lines.append(f"{key}={value}\n")

        with open(self.env_path, "w") as f:
            f.writelines(new_lines)
        
        return True

    def create_backup(self) -> str:
        if not os.path.exists(self.env_path):
            return ""
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M")
        backup_path = f"{self.env_path}.{timestamp}.bak"
        shutil.copy(self.env_path, backup_path)
        return backup_path
