from datetime import date

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('retos', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='reto',
            old_name='fecha_limite',
            new_name='fecha_fin',
        ),
        migrations.AddField(
            model_name='reto',
            name='fecha_inicio',
            field=models.DateField(default=date.today),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='reto',
            name='estado',
            field=models.CharField(
                choices=[
                    ('PENDIENTE', 'Pendiente'),
                    ('EN_CURSO', 'En curso'),
                    ('COMPLETADO', 'Completado'),
                ],
                default='PENDIENTE',
                max_length=12,
            ),
        ),
        migrations.AlterModelOptions(
            name='reto',
            options={
                'ordering': ['-fecha_inicio', 'titulo'],
                'verbose_name': 'reto',
                'verbose_name_plural': 'retos',
            },
        ),
        migrations.CreateModel(
            name='Avance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateField()),
                ('descripcion', models.CharField(max_length=255)),
                ('porcentaje', models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('creado', models.DateTimeField(auto_now_add=True)),
                ('reto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='avances', to='retos.reto')),
            ],
            options={
                'ordering': ['-fecha', '-id'],
                'verbose_name': 'avance',
                'verbose_name_plural': 'avances',
            },
        ),
    ]
