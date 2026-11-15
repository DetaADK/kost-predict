from rest_framework import serializers


class PredictionSerializer(serializers.Serializer):

    jarak_km = serializers.FloatField(min_value=0)

    ac = serializers.ChoiceField(
        choices=["ya", "tidak"]
    )

    rating = serializers.FloatField(
        min_value=0,
        max_value=5
    )