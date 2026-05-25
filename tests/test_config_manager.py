import unittest
from lib.config.manager import ConfigManager

class TestConfigManager(unittest.TestCase):
    def test_instantiation(self):
        manager = ConfigManager("test.env")
        self.assertEqual(manager.env_path, "test.env")

    def test_get_key_found(self):
        # Mock file reading
        from unittest.mock import patch, mock_open
        with patch("os.path.exists", return_value=True):
            with patch("builtins.open", mock_open(read_data="API_KEY=12345\nDB_HOST=localhost")):
                manager = ConfigManager(".env")
                self.assertEqual(manager.get_key("API_KEY"), "12345")

    def test_set_key_new_value(self):
        from unittest.mock import patch, mock_open
        read_data = "API_KEY=12345\n"
        m = mock_open(read_data=read_data)
        with patch("builtins.open", m):
            manager = ConfigManager(".env")
            result = manager.set_key("API_KEY", "67890")
            self.assertTrue(result)
            # Check if writelines was called with expected data
            m().writelines.assert_called_with(["API_KEY=67890\n"])

    def test_set_key_same_value(self):
        from unittest.mock import patch, mock_open
        read_data = "API_KEY=12345\n"
        m = mock_open(read_data=read_data)
        with patch("builtins.open", m):
            manager = ConfigManager(".env")
            # First, mock exists to true
            with patch("os.path.exists", return_value=True):
                result = manager.set_key("API_KEY", "12345")
                self.assertFalse(result)
                # Check that write was NOT called (Idempotency)
                m().write.assert_not_called()

    def test_create_backup_success(self):
        from unittest.mock import patch
        manager = ConfigManager(".env")
        with patch("os.path.exists", return_value=True):
            with patch("shutil.copy") as mock_copy:
                with patch("datetime.datetime") as mock_date:
                    mock_date.now.return_value.strftime.return_value = "202605251030"
                    backup_path = manager.create_backup()
                    self.assertEqual(backup_path, ".env.202605251030.bak")
                    mock_copy.assert_called_with(".env", backup_path)

if __name__ == "__main__":
    unittest.main()
