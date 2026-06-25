class BaseRepository:
    """Repositório base para encapsular acesso ao banco de dados"""

    def __init__(self, db):
        self.db = db
        self.collection_name = None

    @property
    def collection(self):
        if not self.collection_name:
            raise NotImplementedError("collection_name deve ser definida nas subclasses")
        return self.db[self.collection_name]
