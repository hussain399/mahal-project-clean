# from .app import db

# class Category(db.Model):
#     __tablename__ = 'categories'

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(100), unique=True, nullable=False)

#     def to_dict(self):
#         return {"id": self.id, "name": self.name}


# class Product(db.Model):
#     __tablename__ = 'products'

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(100), nullable=False)
#     category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

#     category = db.relationship('Category', backref=db.backref('products', lazy=True))

#     def to_dict(self):
#         return {"id": self.id, "name": self.name, "category_id": self.category_id}
