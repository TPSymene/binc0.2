# Generated by Django 5.1.6 on 2025-04-14 11:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_add_is_active_to_product'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='in_stock',
            field=models.BooleanField(default=True, help_text='Indicates whether the product is currently in stock.', verbose_name='In Stock'),
        ),
    ]
