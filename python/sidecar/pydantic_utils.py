from typing import Optional, Type, get_type_hints

from pydantic import BaseModel


def make_optional(
    include: Optional[list[str]] = None,
    exclude: Optional[list[str]] = None,
):
    """Return a decorator to make model fields optional"""
    # See https://stackoverflow.com/a/74296358/388951

    if exclude is None:
        exclude = []

    # Create the decorator
    def decorator(cls: Type[BaseModel]):
        type_hints = get_type_hints(cls)
        fields = cls.__fields__
        if include is None:
            fields = fields.items()
        else:
            # Create iterator for specified fields
            fields = ((name, fields[name]) for name in include if name in fields)
            # Fields in 'include' that are not in the model are simply ignored,
            # as in BaseModel.dict
        for name, field in fields:
            if name in exclude:
                continue
            if not field.required:
                continue
            # Update pydantic ModelField to not required
            field.required = False
            # Update/append annotation
            cls.__annotations__[name] = Optional[type_hints[name]]
        return cls

    return decorator
