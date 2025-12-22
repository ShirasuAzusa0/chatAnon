from pathlib import Path

def get_key_path():
    home_path = Path(__file__).parent.parent
    key_path = home_path.joinpath("attachments/key")
    if not key_path.exists():
        key_path.mkdir(parents=True)
    return key_path